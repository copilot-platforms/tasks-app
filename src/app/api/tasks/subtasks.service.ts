import { CopilotAPI } from '@/utils/CopilotAPI'
import { buildLtreeNodeString } from '@/utils/ltree'
import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import { UserRole } from '@api/core/types/user'
import { AssigneeType } from '@prisma/client'
import httpStatus from 'http-status'
import { z } from 'zod'

interface Assignable {
  assigneeId: string
  assigneeType: AssigneeType
}

export class SubtaskService extends BaseService {
  async getSubtaskCounts(id: string): Promise<number> {
    const taskId = z.string().uuid().parse(id)
    const level = (
      await this.db.$queryRaw<{ level: number }[] | null>`
      SELECT nlevel("path") as level FROM "Tasks"
      WHERE id = ${taskId}::uuid AND "workspaceId" = ${this.user.workspaceId}
    `
    )?.[0]?.level
    if (!level) {
      throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Path for task was not set')
    }
    return level
  }

  async addSubtaskCount(id: string, increment: number = 1) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { increment } },
    })
  }

  async decreaseSubtaskCount(id: string, decrement: number = 1) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { decrement } },
    })
  }

  /**
   * Soft-deletes all tasks where children have path derived from parent task's
   * @param id Parent Task id
   */
  async softDeleteAllSubtasks(id: string) {
    console.info('SubtasksService#deleteAllSubtasks | Deleting all subtasks for parent with id', id)

    const taskLabels = (
      await this.db.$queryRawUnsafe<Array<{ label: string }>>(
        `
          SELECT "label"
          FROM "Tasks"
          WHERE "deletedAt" IS NULL
            AND "workspaceId" = $1
            AND path @ '${buildLtreeNodeString(id)}'`,
        // Without injecting ltree path like this, Prisma throws an error....
        // even though the rendered SQL works fine when executed in a query console
        this.user.workspaceId,
      )
    ).map((row) => row.label)

    await this.db.task.deleteMany({ where: { label: { in: taskLabels } } })
    await this.db.label.deleteMany({ where: { label: { in: taskLabels } } })
  }

  /**
   * Marks archived / unarhived for all subtasks that are children of parent task
   */
  async toggleArchiveForAllSubtasks(id: string, archive: boolean) {
    console.info('SubtasksService#deleteAllSubtasks | Deleting all subtasks for parent with id', id)
    await this.db.$executeRawUnsafe(
      `
        UPDATE "Tasks"
        SET "isArchived" = $1, "lastArchivedDate" = ${archive ? 'NOW()' : 'NULL'}
        WHERE "deletedAt" IS NULL
          AND "workspaceId" = $2
          AND path @ '${buildLtreeNodeString(id)}'
      `,
      archive,
      this.user.workspaceId,
    )
  }

  async getAccessiblePathTasks<T extends Assignable>(tasks: T[]): Promise<T[]> {
    //  find the last index of the task that is unaccessible to the user
    //  return all tasks starting from index + 1 -> last value of tasks
    let latestAccessibleTaskIndex: number
    // If user is an internal user with client access limitations, they can only access tasks assigned to clients or company they have access to
    if (this.user.role === UserRole.IU) {
      const copilot = new CopilotAPI(this.user.token)
      const iu = await copilot.getInternalUser(z.string().parse(this.user.internalUserId))
      if (!iu.isClientAccessLimited) {
        return tasks
      }
      const clients = await copilot.getClients({ limit: 1_000_000 })
      latestAccessibleTaskIndex = tasks.findLastIndex((task) => {
        if (task.assigneeType === AssigneeType.internalUser) return false
        else if (task.assigneeType === AssigneeType.client) {
          const client = clients.data?.find((client) => client.id === task.assigneeId)
          if (!client || !client.companyId) {
            return true
          }
          const taskClientsCompanyId = z.string().parse(client?.companyId)
          return !iu.companyAccessList?.includes(taskClientsCompanyId)
        } else {
          // company
          return !iu.companyAccessList?.includes(task.assigneeId)
        }
      })
    } else if (this.user.role === UserRole.Client) {
      // If user is a client, just check index of which task was last assigned to client
      latestAccessibleTaskIndex = tasks.findLastIndex(
        (task) => task.assigneeId !== this.user.clientId && task.assigneeId !== this.user.companyId,
      )
    } else {
      throw new APIError(httpStatus.BAD_REQUEST, 'Failed to parse user role from token')
    }
    return tasks.slice(latestAccessibleTaskIndex + 1)
  }
}
