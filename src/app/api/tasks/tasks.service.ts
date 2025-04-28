import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'
import { deleteTaskNotifications, sendTaskCreateNotifications, sendTaskUpdateNotifications } from '@/jobs/notifications'
import { sendClientUpdateTaskNotifications } from '@/jobs/notifications/send-client-task-update-notifications'
import { ClientResponse, CompanyResponse, InternalUsers } from '@/types/common'
import { TaskWithWorkflowState } from '@/types/db'
import { AncestorTaskResponse, CreateTaskRequest, UpdateTaskRequest } from '@/types/dto/tasks.dto'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { buildLtree, buildLtreeNodeString, getIdsFromLtreePath } from '@/utils/ltree'
import { getFilePathFromUrl, replaceImageSrc } from '@/utils/signedUrlReplacer'
import { getSignedUrl } from '@/utils/signUrl'
import { SupabaseActions } from '@/utils/SupabaseActions'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction, UserRole } from '@api/core/types/user'
import { LabelMappingService } from '@api/label-mapping/label-mapping.service'
import { SubtaskService } from '@api/tasks/subtasks.service'
import { getArchivedStatus, getTaskTimestamps } from '@api/tasks/tasks.helpers'
import { TasksActivityLogger } from '@api/tasks/tasks.logger'
import { AssigneeType, Prisma, PrismaClient, StateType, Task, WorkflowState } from '@prisma/client'
import dayjs from 'dayjs'
import httpStatus from 'http-status'
import { z } from 'zod'
import { maxSubTaskDepth } from '@/constants/tasks'
import { isPastDate } from '@/utils/dateHelper'

export class TasksService extends BaseService {
  /**
   * Builds filter for "get" service methods.
   * If user is an IU, return filter for all tasks associated with this workspace
   * If user is a client, return filter for just the tasks assigned to this clientId.
   * If user is a client and has a companyId, return filter for just the tasks assigned to this clientId `OR` to this companyId
   */
  private buildTaskPermissions(id?: string) {
    const user = this.user

    // Default filters
    let filters: Prisma.TaskWhereInput = {
      id,
      workspaceId: user.workspaceId,
    }

    if (user.clientId) {
      filters = { ...filters, ...this.getClientOrCompanyAssigneeFilter() }
    }

    return filters
  }

  async getAllTasks(queryFilters: {
    // Global filters
    all?: boolean
    showIncompleteOnly?: boolean
    // Public Api filters
    fromPublicApi?: boolean
    // Column filters
    showArchived: boolean
    showUnarchived: boolean
    assigneeId?: string
    createdById?: string
    parentId?: string | null
    workflowState?: { type: StateType }
    limit?: number
    lastIdCursor?: string // When this id field cursor is provided, we return data AFTER this id
  }): Promise<TaskWithWorkflowState[]> {
    // Check if given user role is authorized access to this resource
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters: Prisma.TaskWhereInput = this.buildTaskPermissions()

    let isArchived: boolean | undefined = false
    if (queryFilters.all) {
      isArchived = undefined
    } else {
      // Archived tasks are only accessible to IU
      // If both archived filters are explicitly 0 / falsey for IU, shortcircuit and return empty array
      if (!queryFilters.showArchived && !queryFilters.showUnarchived) {
        return []
      }
      isArchived = getArchivedStatus(queryFilters.showArchived, queryFilters.showUnarchived)
    }

    if (queryFilters.showIncompleteOnly && !queryFilters.fromPublicApi) {
      filters.workflowState = {
        type: { not: StateType.completed },
      }
    }

    // If `parentId` is present, filter by parentId, ELSE return top-level parent comments
    filters.parentId = queryFilters.all
      ? undefined // if querying all accessible tasks, parentId filter doesn't make sense
      : await this.getParentIdFilter(queryFilters.parentId)

    const disjointTasksFilter: Prisma.TaskWhereInput =
      queryFilters.all || queryFilters.parentId
        ? {} // No need to support disjoint tasks when querying all tasks / subtasks
        : await this.getDisjointTasksFilter(queryFilters.parentId)

    // NOTE: Terminology:
    // Disjoint task -> A task where the parent task is not assigned to / inaccessible to the current user,
    // but the subtask is accessible

    const where: Prisma.TaskWhereInput = {
      ...filters,
      ...disjointTasksFilter,
      assigneeId: queryFilters.assigneeId,
      createdById: queryFilters.createdById,
      workflowState: queryFilters.workflowState,
      isArchived,
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [{ createdAt: 'desc' }]
    if (!queryFilters.fromPublicApi) {
      // For web, we show dueDate as the primary sort key
      orderBy.unshift({ dueDate: { sort: 'asc', nulls: 'last' } })
    }

    const pagination: Prisma.TaskFindManyArgs = {
      take: queryFilters.limit,
      cursor: queryFilters.lastIdCursor ? { id: queryFilters.lastIdCursor } : undefined,
      skip: queryFilters.lastIdCursor ? 1 : undefined,
    }

    const tasks = await this.db.task.findMany({
      where,
      orderBy,
      ...pagination,
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })

    if (!this.user.internalUserId || queryFilters.fromPublicApi) {
      return tasks
    }

    // Now we have the challenge of figuring out if a task is assigned to a client / company that falls in IU's access list
    const copilot = new CopilotAPI(this.user.token)
    const currentInternalUser = await copilot.getInternalUser(this.user.internalUserId)
    if (!currentInternalUser.isClientAccessLimited) return tasks

    const filteredTasks = await this.filterTasksByClientAccess(tasks, currentInternalUser)
    return filteredTasks
  }

  async createTask(data: CreateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.Tasks)

    //generate the label
    const labelMappingService = new LabelMappingService(this.user)
    const label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))
    if (data.parentId) {
      const canCreateSubTask = await this.canCreateSubTask(data.parentId)
      if (!canCreateSubTask) {
        throw new APIError(httpStatus.BAD_REQUEST, 'Reached the maximum subtask depth for this task')
      }
    }

    if (data.dueDate && isPastDate(data.dueDate)) {
      throw new APIError(httpStatus.BAD_REQUEST, 'Due date cannot be in the past')
    }

    // Create a new task associated with current workspaceId. Also inject current request user as the creator.
    const newTask = await this.db.task.create({
      data: {
        ...data,
        workspaceId: this.user.workspaceId,
        createdById: this.user.internalUserId as string,
        label: label,
        ...(await getTaskTimestamps('create', this.user, data)),
      },
      include: { workflowState: true },
    })

    if (newTask) {
      // Add activity logs
      const activityLogger = new TasksActivityLogger(this.user, newTask)
      await activityLogger.logNewTask()

      try {
        if (newTask.body) {
          const newBody = await this.updateTaskIdOfAttachmentsAfterCreation(newTask.body, newTask.id)
          // Update task body with replaced attachment sources
          await this.db.task.update({
            where: { id: newTask.id },
            data: {
              body: newBody,
            },
          })
        }

        // Add ltree path for task
        await this.addPathToTask(newTask)

        // Increment parent task's subtask count, if exists
        if (newTask.parentId) {
          const subtaskService = new SubtaskService(this.user)
          await subtaskService.addSubtaskCount(newTask.parentId)
        }
      } catch (e: unknown) {
        // Manually rollback task creation
        await this.db.$transaction([
          this.db.task.delete({ where: { id: newTask.id } }),
          this.db.activityLog.deleteMany({ where: { taskId: newTask.id } }),
        ])
        console.error('TasksService#createTask | Rolling back task creation', e)
        throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to post-process task, new task was not created.')
      }
    }

    // Send task created notifications to users
    await sendTaskCreateNotifications.trigger({ user: this.user, task: newTask })

    return newTask
  }

  async getOneTask(id: string): Promise<Task & { workflowState: WorkflowState }> {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)

    // Build query filters based on role of user. IU can access all tasks related to a workspace
    // while clients can only view the tasks assigned to them or their company
    const filters = this.buildTaskPermissions(id)

    const task = await this.db.task.findFirst({ where: filters })
    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    const updatedTask = await this.db.task.update({
      where: { id: task.id },
      data: {
        body: task.body && (await replaceImageSrc(task.body, getSignedUrl)),
      },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })

    return updatedTask
  }

  async getTaskAssignee(task: Task): Promise<InternalUsers | ClientResponse | CompanyResponse | undefined> {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.Tasks)
    if (!task.assigneeId || !task.assigneeType) return undefined

    const copilot = new CopilotAPI(this.user.token)
    switch (task.assigneeType) {
      case AssigneeType.internalUser:
        return await copilot.getInternalUser(task.assigneeId)
      case AssigneeType.client:
        return await copilot.getClient(task.assigneeId)
      default:
        return await copilot.getCompany(task.assigneeId)
    }
  }

  async updateOneTask(id: string, data: UpdateTaskRequest) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Update, Resource.Tasks)

    // Query previous task
    const filters = this.buildTaskPermissions(id)
    // Validate updated due date to not be in the past
    if (data.dueDate && dayjs(new Date(data.dueDate)).isBefore(dayjs())) {
      throw new APIError(httpStatus.BAD_REQUEST, 'Due date cannot be in the past')
    }

    const prevTask = await this.db.task.findFirst({
      where: filters,
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    let updatedTask = await this.db.$transaction(async (tx) => {
      //generate new label if prevTask has no assignee but now assigned to someone
      let label: string = prevTask.label
      if (!prevTask.assigneeId && data.assigneeId) {
        const labelMappingService = new LabelMappingService(this.user)
        labelMappingService.setTransaction(tx as PrismaClient)
        //delete the existing label
        await labelMappingService.deleteLabel(prevTask.label)
        label = z.string().parse(await labelMappingService.getLabel(data.assigneeId, data.assigneeType))
      }

      // Set / reset lastArchivedDate if isArchived has been triggered, else remove it from the update query
      let lastArchivedDate: Date | undefined | null = undefined
      if (data.isArchived !== undefined && prevTask.isArchived !== data.isArchived) {
        lastArchivedDate = data.isArchived === true ? new Date() : data.isArchived === false ? null : undefined
      }

      // Get the updated task
      const updatedTask = await tx.task.update({
        where: { id },
        data: {
          ...data,
          assigneeId: data.assigneeId === '' ? null : data.assigneeId,
          label,
          lastArchivedDate,
          ...(await getTaskTimestamps('update', this.user, data, prevTask)),
        },
        include: { workflowState: true },
      })

      // Archive / unarchive all subtasks if parent task is archived / unarchived
      if (prevTask.isArchived !== data.isArchived && data.isArchived !== undefined) {
        const subtaskService = new SubtaskService(this.user)
        subtaskService.setTransaction(tx as PrismaClient)
        await subtaskService.toggleArchiveForAllSubtasks(id, data.isArchived)
      }

      return updatedTask
    })

    if (updatedTask) {
      const activityLogger = new TasksActivityLogger(this.user, updatedTask)
      await activityLogger.logTaskUpdated(prevTask)

      await sendTaskUpdateNotifications.trigger({ prevTask, updatedTask, user: this.user })
    }

    return updatedTask
  }

  async deleteOneTask(id: string, recursive: boolean = true) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Delete, Resource.Tasks)

    // Try to delete existing client notification related to this task if exists
    const task = await this.db.task.findFirst({
      where: { id, workspaceId: this.user.workspaceId },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })

    if (!task) throw new APIError(httpStatus.NOT_FOUND, 'The requested task to delete was not found')

    if (!recursive) {
      if (task.subtaskCount > 0) {
        throw new APIError(httpStatus.CONFLICT, 'Cannot delete task with subtasks. Use recursive delete instead.')
      }
    }

    //delete the associated label
    const labelMappingService = new LabelMappingService(this.user)
    await this.db.$transaction(async (tx) => {
      labelMappingService.setTransaction(tx as PrismaClient)
      await labelMappingService.deleteLabel(task?.label)

      await tx.task.delete({ where: { id, workspaceId: this.user.workspaceId } })
      const subtaskService = new SubtaskService(this.user)
      subtaskService.setTransaction(tx as PrismaClient)
      if (task.parentId) {
        await subtaskService.decreaseSubtaskCount(task.parentId)
      }
      await subtaskService.softDeleteAllSubtasks(task.id)
    })

    await deleteTaskNotifications.trigger({ user: this.user, task })

    return task

    // Logic to remove internal user notifications when a task is deleted / assignee is deleted
    // ...In case requirements change later again
    // const notificationService = new NotificationService(this.user)
    // await notificationService.deleteInternalUserNotificationForTask(id)
  }

  async getPathOfTask(id: string) {
    return (
      await this.db.$queryRaw<{ path: string }[] | null>`
          SELECT "path"
          FROM "Tasks"
          WHERE id::text = ${id}
            AND "workspaceId" = ${this.user.workspaceId}
        `
    )?.[0]?.path
  }

  private getClientOrCompanyAssigneeFilter(): Prisma.TaskWhereInput {
    const parsedClientId = z.string().safeParse(this.user.clientId)
    if (!parsedClientId.data) return {}

    const clientId = parsedClientId.data
    const parsedCompanyId = z.string().safeParse(this.user.companyId)

    if (!parsedCompanyId.data) {
      return {
        OR: [{ assigneeId: clientId, assigneeType: 'client' }],
      }
    }

    return {
      OR: [
        { assigneeId: clientId as string, assigneeType: 'client' },
        { assigneeId: parsedCompanyId.data, assigneeType: 'company' },
      ],
    }
  }

  private getSelectColumns = (columns?: string[]) => {
    if (!columns) return undefined
    const select: Record<string, true> = {}
    columns.forEach((column) => (select[column] = true))
    return select
  }

  private getDisjointTasksFilter = (parentId?: string | null) => {
    // For disjoint tasks, show this subtask as a root-level task
    // This n-node matcher matches any task tree chain where previous task's assigneeId is not self's
    // E.g. A -> B -> C, where A is assigned to user 1, B is assigned to user 2, C is assigned to user 2
    // For user 2, task B should show up as a parent task in the main task board
    const disjointTasksFilter: Promise<Prisma.TaskWhereInput> = (async () => {
      if (this.user.role === UserRole.IU || parentId) {
        return {}
      }

      return {
        OR: [
          // Parent is not assigned to client
          {
            ...this.getClientOrCompanyAssigneeFilter(), // Prevent overwriting of OR statement
            parent: {
              AND: [{ assigneeId: { not: this.user.clientId } }, { assigneeId: { not: this.user.companyId } }],
            },
          },
          // Task is a parent / standalone task
          {
            ...this.getClientOrCompanyAssigneeFilter(),
            parentId: null,
          },
        ],
      }
    })()
    return disjointTasksFilter
  }

  private async getParentIdFilter(parentId?: string | null) {
    // If `parentId` is present, filter by parentId
    if (parentId) {
      return z.string().uuid().parse(parentId)
    }
    // If user is IU, no need to flatten subtasks
    if (this.user.role === UserRole.IU) {
      const copilot = new CopilotAPI(this.user.token)
      if (this.user.internalUserId) {
        const currentInternalUser = await copilot.getInternalUser(this.user.internalUserId)
        if (currentInternalUser.isClientAccessLimited) {
          return undefined
        }
      }
      return null
    }
    // If user is client, flatten subtasks by not filtering by parentId right now
    return undefined
  }

  private async addPathToTask(task: Task) {
    let path: string = buildLtreeNodeString(task.id)
    if (task.parentId) {
      const parentPath = await this.getPathOfTask(task.parentId)
      if (!parentPath) {
        throw new APIError(httpStatus.NOT_FOUND, 'The requested parent task was not found')
      }
      path = buildLtree(parentPath, task.id)
    }

    await this.db.$executeRaw`
      UPDATE "Tasks"
      SET path = ${buildLtreeNodeString(path)}::ltree
      WHERE id::text = ${task.id}
        AND "workspaceId" = ${this.user.workspaceId}
    `
  }

  private async updateTaskIdOfAttachmentsAfterCreation(htmlString: string, task_id: string) {
    const imgTagRegex = /<img\s+[^>]*src="([^"]+)"[^>]*>/g //expression used to match all img srcs in provided HTML string.
    const attachmentTagRegex = /<\s*[a-zA-Z]+\s+[^>]*data-type="attachment"[^>]*src="([^"]+)"[^>]*>/g //expression used to match all attachment srcs in provided HTML string.
    let match
    const replacements: { originalSrc: string; newUrl: string }[] = []

    const newFilePaths: { originalSrc: string; newFilePath: string }[] = []
    const copyAttachmentPromises: Promise<void>[] = []
    const matches: { originalSrc: string; filePath: string; fileName: string }[] = []

    while ((match = imgTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    while ((match = attachmentTagRegex.exec(htmlString)) !== null) {
      const originalSrc = match[1]
      const filePath = getFilePathFromUrl(originalSrc)
      const fileName = filePath?.split('/').pop()
      if (filePath && fileName) {
        matches.push({ originalSrc, filePath, fileName })
      }
    }

    for (const { originalSrc, filePath, fileName } of matches) {
      const newFilePath = `${this.user.workspaceId}/${task_id}/${fileName}`
      const supabaseActions = new SupabaseActions()
      copyAttachmentPromises.push(supabaseActions.moveAttachment(filePath, newFilePath))
      newFilePaths.push({ originalSrc, newFilePath })
    }

    await Promise.all(copyAttachmentPromises)

    const signedUrlPromises = newFilePaths.map(async ({ originalSrc, newFilePath }) => {
      const newUrl = await getSignedUrl(newFilePath)
      if (newUrl) {
        replacements.push({ originalSrc, newUrl })
      }
    })

    await Promise.all(signedUrlPromises)

    for (const { originalSrc, newUrl } of replacements) {
      htmlString = htmlString.replace(originalSrc, newUrl)
    }
    const filePaths = newFilePaths.map(({ newFilePath }) => newFilePath)
    await this.db.scrapMedia.updateMany({
      where: {
        filePath: {
          in: filePaths,
        },
      },
      data: {
        taskId: task_id,
      },
    })
    return htmlString
  }

  async setNewLastActivityLogUpdated(taskId: string) {
    // This shouldn't crash our app, just in case
    try {
      await this.db.task.update({
        where: { id: taskId, workspaceId: this.user.workspaceId },
        data: {
          lastActivityLogUpdated: new Date(),
        },
      })
    } catch (e) {
      console.error('TaskService#setNewLastActivityLogUpdated::', e)
    }
  }

  async getIncompleteTasksForCompany(assigneeId: string): Promise<(Task & { workflowState: WorkflowState })[]> {
    // This works across workspaces
    return await this.db.task.findMany({
      where: {
        assigneeId,
        assigneeType: AssigneeType.company,
        workflowState: { type: { not: StateType.completed } },
        isArchived: false,
      },
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })
  }

  async deleteAllAssigneeTasks(assigneeId: string, assigneeType: AssigneeType) {
    // Policies validation shouldn't be required here because token is from a webhook event
    const tasks = await this.db.task.findMany({
      where: { assigneeId, assigneeType, workspaceId: this.user.workspaceId },
    })
    if (!tasks.length) {
      // If assignee doesn't have an associated task at all, skip logic
      return []
    }
    const labels = tasks.map((task) => task.label)

    await this.db.task.deleteMany({
      where: { assigneeId, assigneeType, workspaceId: this.user.workspaceId },
    })
    await this.db.label.deleteMany({ where: { label: { in: labels } } })
    return tasks
  }

  async clientUpdateTask(id: string, targetWorkflowStateId?: string | null) {
    //Apply custom authorization here. Policy service is not used because this api is for client's Mark done function only. Only clients can use this.
    if (this.user.role === UserRole.IU) {
      throw new APIError(httpStatus.UNAUTHORIZED, 'You are not authorized to perform this action')
    }

    // Query previous task
    const filters = this.buildTaskPermissions(id)
    const prevTask = await this.db.task.findFirst({
      where: filters,
      relationLoadStrategy: 'join',
      include: { workflowState: true },
    })
    if (!prevTask) throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')

    //get Completed or custom workflowState data
    const updatedWorkflowState = await this.db.workflowState.findFirst({
      where: {
        id: targetWorkflowStateId ? targetWorkflowStateId : undefined,
        type: targetWorkflowStateId ? undefined : StateType.completed,
        workspaceId: this.user.workspaceId,
      },
    })
    const data = { workflowStateId: updatedWorkflowState?.id }
    // Get the updated task
    const updatedTask = await this.db.task.update({
      where: { id },
      data: {
        ...data,
        ...(await getTaskTimestamps('update', this.user, data, prevTask)),
      },
      include: { workflowState: true },
    })

    if (updatedTask) {
      const activityLogger = new TasksActivityLogger(this.user, updatedTask)
      await activityLogger.logTaskUpdated(prevTask)
    }

    await sendClientUpdateTaskNotifications.trigger({ user: this.user, prevTask, updatedTask, updatedWorkflowState })
    return updatedTask
  }

  async getTraversalPath(id: string): Promise<AncestorTaskResponse[]> {
    const taskWithPath = (
      await this.db.$queryRaw<{ path: string }[]>`
      SELECT "path" from "Tasks"
      WHERE id = ${id}::uuid
      LIMIT 1
    `
    )?.[0]
    if (!taskWithPath) {
      throw new APIError(httpStatus.NOT_FOUND, 'The requested task was not found')
    }

    const parents = getIdsFromLtreePath(taskWithPath.path)
    const parentTasks = await Promise.all(
      parents.map((id) =>
        this.db.task.findFirstOrThrow({
          where: { id, workspaceId: this.user.workspaceId },
          select: { id: true, title: true, label: true, assigneeId: true, assigneeType: true },
        }),
      ) as Promise<AncestorTaskResponse>[],
    )

    const subtaskService = new SubtaskService(this.user)
    return await subtaskService.getAccessiblePathTasks(parentTasks)
  }

  private async filterTasksByClientAccess<T extends Task[] | Pick<Task, 'id' | 'assigneeId' | 'assigneeType'>[]>(
    tasks: T,
    currentInternalUser: InternalUsers,
  ) {
    const copilot = new CopilotAPI(this.user.token)
    const hasClientTasks = tasks.some((task) => task.assigneeType === AssigneeType.client)
    const clients = hasClientTasks ? await copilot.getClients({ limit: MAX_FETCH_ASSIGNEE_COUNT }) : { data: [] }

    return tasks.filter((task) => {
      if (!task.assigneeId || task.assigneeType === AssigneeType.internalUser) return true

      if (task.assigneeType === AssigneeType.company) {
        return currentInternalUser.companyAccessList?.includes(task.assigneeId)
      }
      const taskClient = clients.data?.find((client) => client.id === task.assigneeId)
      if (!taskClient || !taskClient.companyId) {
        return false
      }
      const taskClientsCompanyId = z.string().parse(taskClient?.companyId)
      return currentInternalUser.companyAccessList?.includes(taskClientsCompanyId)
    }) as T
  }

  async hasMoreTasksAfterCursor(
    id: string,
    publicFilters: Partial<Parameters<TasksService['getAllTasks']>[0]>,
  ): Promise<boolean> {
    const nextTask = await this.db.task.findFirst({
      where: { ...publicFilters, workspaceId: this.user.workspaceId },
      cursor: { id },
      skip: 1,
      orderBy: { createdAt: 'desc' },
    })
    return !!nextTask
  }

  async canCreateSubTask(taskId: string): Promise<boolean> {
    const parentPath = await this.getPathOfTask(taskId)
    if (!parentPath) {
      throw new APIError(httpStatus.NOT_FOUND, 'The requested parent task was not found')
    }
    const uuidLength = parentPath.split('.').length
    if (!uuidLength) return true
    return uuidLength <= maxSubTaskDepth
  }
}
