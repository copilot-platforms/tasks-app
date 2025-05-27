'use client'

import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { selectTaskBoard, setAccessibleTasks, setActiveTask, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { InternalUsersSchema, Token } from '@/types/common'
import { IAssigneeCombined } from '@/types/interfaces'
import { AssigneeType } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { z } from 'zod'

export class RealtimeHandler {
  constructor(
    private readonly payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>,
    private readonly user: IAssigneeCombined,
    private readonly userRole: AssigneeType,
    private readonly handleDelete: (newTask: RealTimeTaskResponse) => void,
    private readonly tokenPayload?: Token,
  ) {}

  private getFormattedTask(task: unknown): RealTimeTaskResponse {
    const newTask = task as RealTimeTaskResponse
    // NOTE: we append a Z here to make JS understand this raw timestamp (in format YYYY-MM-DD:HH:MM:SS.MS) is in UTC timezone
    // New payloads listened on the 'INSERT' action in realtime doesn't contain this tz info so the order can mess up,
    // causing tasks to bounce around on hover
    return {
      ...newTask,
      createdAt: newTask.createdAt && new Date(newTask.createdAt + 'Z'),
      updatedAt: newTask.updatedAt && new Date(newTask.updatedAt + 'Z'),
    }
  }

  /**
   * Filters out tasks this user type does not have access to
   */
  private isSubtaskAccessible(newTask: RealTimeTaskResponse): boolean {
    const currentState = store.getState()
    const { assignee } = selectTaskBoard(currentState)
    // Ignore all tasks that belong to client / company in user's limited access array, if IU is ClientAccessLimited
    if (this.userRole === AssigneeType.internalUser) {
      const iu = InternalUsersSchema.parse(this.user)
      if (iu.isClientAccessLimited) {
        const companyAccessList = iu.companyAccessList || []
        if (newTask.assigneeType === AssigneeType.client) {
          const client = assignee.find((user) => user.id === newTask.assigneeId)
          if (!client) return false
          if (!companyAccessList.includes(z.string().parse(client.companyId))) {
            return false
          }
        } else if (newTask.assigneeType === AssigneeType.company) {
          if (!companyAccessList.includes(newTask.assigneeId)) {
            return false
          }
        }
      }
    } else if (this.userRole === AssigneeType.client) {
      // Ignore all tasks that don't belong to client
      if (newTask.assigneeId !== this.user.id && newTask.assigneeId !== this.user.companyId) {
        return false
      }
    } else {
      console.error("Couldn't validate realtime task access because userRole is not defined")
      return false
    }
    return true
  }

  /**
   * Handler for subtask insert, for subtasks that are accessible to the current user
   */
  private handleRealtimeSubtaskInsert(newTask: RealTimeTaskResponse) {
    const currentState = store.getState()
    const { tasks, accessibleTasks } = selectTaskBoard(currentState)

    // Check if this new task is a disjoint task by checking if accessible tasks array contains its parent.
    // If it is a disjoint task we need to insert it to the fkin board
    const isParentTaskAccessible = accessibleTasks.some((task) => task.id === newTask.parentId)

    if (this.userRole === AssigneeType.internalUser) {
      const user = InternalUsersSchema.parse(this.user)
      if (user.isClientAccessLimited && !isParentTaskAccessible) {
        store.dispatch(setTasks([...tasks, newTask]))
      }
    }
    if (this.userRole === AssigneeType.client && !isParentTaskAccessible) {
      store.dispatch(setTasks([...tasks, newTask]))
    }
    // Append this new task to set of accessible tasks
    store.dispatch(setAccessibleTasks([...accessibleTasks, newTask]))
  }

  /**
   * Handler for subtask update, for subtasks that are accessible to the current user
   */
  private handleRealtimeSubtaskUpdate(newTask: RealTimeTaskResponse) {
    const currentState = store.getState()
    const { tasks, accessibleTasks, activeTask } = selectTaskBoard(currentState)

    const isTaskVisibleInBoard = tasks.some((task) => task.id === newTask.id)
    const filterOutNewTask = <T extends { id: string }>(tasks: T[]): T[] => {
      return tasks.filter((task) => task.id !== newTask.id)
    }

    // Remove from tasks and accessibleTasks array, if task has been deleted.
    if (newTask.deletedAt) {
      if (isTaskVisibleInBoard) {
        store.dispatch(setTasks(filterOutNewTask(tasks)))
      }
      store.dispatch(setAccessibleTasks(filterOutNewTask(accessibleTasks)))
      // If there are disjoint child tasks floating around in the task board - support multiple levels of nesting for the future
      if (tasks.some((task) => task.parentId === newTask.id)) {
        store.dispatch(setTasks(tasks.filter((task) => task.parentId !== newTask.id)))
      }

      return this.handleDelete(newTask)
    }

    const isParentTaskAccessible = accessibleTasks.some((task) => task.id === newTask.parentId)
    if (this.isSubtaskAccessible(newTask)) {
      // If task is accessible, add it to the tasks array
      if (!isTaskVisibleInBoard && !isParentTaskAccessible) {
        store.dispatch(setTasks([...tasks, newTask]))
        store.dispatch(setAccessibleTasks([...accessibleTasks, newTask]))
      }
    }

    // It's possible that a subtask exists in `tasks` because it can be a disjoint task, update it
    if (isTaskVisibleInBoard) {
      store.dispatch(
        setTasks(
          tasks.map((task) => {
            return task.id === newTask.id
              ? // Update task - account for TOAST behavior in `body`, and format realtime postgres' timestamp
                { ...newTask, body: newTask.body || task.body }
              : task
          }),
        ),
      )
    }

    if (activeTask && activeTask.id === newTask.id) {
      store.dispatch(setActiveTask(newTask))
    } //updating active task if a user is currently in details page of the task being udpated
    // Update it in accessible tasks
    store.dispatch(
      setAccessibleTasks(
        accessibleTasks.map((task) => {
          return task.id === newTask.id ? { ...newTask, body: newTask.body || task.body } : task
        }),
      ),
    )
  }

  /**
   * Handler for realtime subtasks
   */
  handleRealtimeSubtasks() {
    const currentState = store.getState()
    const { tasks, accessibleTasks } = selectTaskBoard(currentState)

    const newTask = this.getFormattedTask(this.payload.new)

    // Being a subtask, this surely has a valid non-null parentId
    newTask.parentId = z.string().parse(newTask.parentId)

    if (!this.isSubtaskAccessible(newTask)) {
      if (tasks.some((task) => task.id === newTask.id)) {
        store.dispatch(setTasks(tasks.filter((task) => task.id !== newTask.id)))
        store.dispatch(setAccessibleTasks(accessibleTasks.filter((task) => task.id !== newTask.id)))
      }
      return
    }

    if (this.payload.eventType === 'INSERT') {
      return this.handleRealtimeSubtaskInsert(newTask)
    } else if (this.payload.eventType === 'UPDATE') {
      return this.handleRealtimeSubtaskUpdate(newTask)
    }
  }

  /**
   * Handler for realtime task inserts
   */
  handleRealtimeTaskInsert() {
    const newTask = this.getFormattedTask(this.payload.new)

    // Failsafe even though realtime filter is already in place
    if (newTask.workspaceId !== this.tokenPayload?.workspaceId) {
      return
    }

    const commonStore = store.getState()
    const { assignee, accessibleTasks, showUnarchived, tasks } = commonStore.taskBoard

    // Step 1: Add to accessibleTasks array (store of all accessible tasks for current user in state)
    // --- Internal User
    if (
      this.user &&
      this.userRole === AssigneeType.internalUser &&
      InternalUsersSchema.parse(this.user).isClientAccessLimited
    ) {
      const iu = InternalUsersSchema.parse(this.user)
      let isIuAccessibleTask =
        !iu.isClientAccessLimited || (iu.isClientAccessLimited && assignee.some((user) => user.id === newTask.assigneeId))
      if (isIuAccessibleTask) {
        store.dispatch(setAccessibleTasks([...accessibleTasks, newTask]))
      }
    }
    // --- Client
    if (this.userRole === AssigneeType.client) {
      const isClientOrCompanyTask = [this.tokenPayload?.clientId, this.tokenPayload?.companyId].includes(newTask.assigneeId)
      if (isClientOrCompanyTask) {
        store.dispatch(setAccessibleTasks([...accessibleTasks, newTask]))
      }
    }

    // Step 2: Add to tasks array (show in task board)
    if (showUnarchived) {
      store.dispatch(
        setTasks([
          // Remove any previously disjointed tasks from the board
          ...tasks.filter((task) => task.parentId !== newTask.id),
          newTask,
        ]),
      )
    }
  }
}
