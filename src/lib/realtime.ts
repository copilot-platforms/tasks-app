import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { setAccessibleTasks, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { InternalUsersSchema } from '@/types/common'
import { AccessibleTasksResponse, TaskResponse } from '@/types/dto/tasks.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { AssigneeType } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { z } from 'zod'

export class RealtimeHandler {
  constructor(
    private readonly payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>,
    private readonly user: IAssigneeCombined,
    private readonly userRole: AssigneeType,
    private readonly assignee: IAssigneeCombined[],
    private readonly tasks: TaskResponse[],
    private readonly accessibleTasks: AccessibleTasksResponse[],
  ) {}

  /**
   * Filters out tasks this user type does not have access to
   */
  private isTaskAccessible(newTask: RealTimeTaskResponse): boolean {
    // Ignore all tasks that belong to client / company in user's limited access array, if IU is ClientAccessLimited
    if (this.userRole === AssigneeType.internalUser) {
      const iu = InternalUsersSchema.parse(this.user)
      if (iu.isClientAccessLimited) {
        let companyId: string = ''
        const companyAccessList = iu.companyAccessList || []
        if (newTask.assigneeType === AssigneeType.client) {
          const client = this.assignee.find((user) => user.id === newTask.assigneeId)
          if (!client) return false
          companyId = z.string().uuid().parse(client.companyId)
        } else if (newTask.assigneeType === AssigneeType.company) {
          companyId = newTask.assigneeId
        }
        if (!companyAccessList.includes(companyId)) {
          return false
        }
      }
    } else if (this.userRole === AssigneeType.client) {
      // Ignore all tasks that don't belong to client
      if (newTask.assigneeId !== this.user.id && newTask.assigneeId !== this.user.companyId) {
        return false
      }
    }
    return true
  }

  /**
   * Validates that payload contains all necessary fields
   */
  private isValidPayload() {
    return (
      this.payload.new &&
      Object.keys(this.payload.new).includes('assigneeId') &&
      Object.keys(this.payload.new).includes('assigneeType') &&
      Object.keys(this.payload.new).includes('parentId') &&
      Object.keys(this.payload.new).includes('title')
      // body may not be in payload due to postgres TOAST mechanism
    )
  }

  /**
   * Handler for subtask insert, for subtasks that are accessible to the current user
   */
  private handleRealtimeSubtaskInsert(newTask: RealTimeTaskResponse) {
    // Check if this new task is a disjoint task by checking if accessible tasks array contains its parent.
    // If it is a disjoint task we need to insert it to the fkin board
    const isParentTaskAccessible = this.accessibleTasks.some((task) => task.id === newTask.parentId)
    // TODO: can implement flattened disjoint tasks for IU (parent is assigned to limited client / company) here
    if (this.userRole === AssigneeType.client && !isParentTaskAccessible) {
      store.dispatch(setTasks([newTask, ...this.tasks]))
    }
    // Append this new task to set of accessible tasks
    store.dispatch(setAccessibleTasks([newTask, ...this.accessibleTasks]))
  }

  /**
   * Handler for subtask update, for subtasks that are accessible to the current user
   */
  private handleRealtimeSubtaskUpdate(newTask: RealTimeTaskResponse) {
    // We need to handle:
    // 1. deletedAt - remove from tasks and accessibleTasks arrays
    // 2. title & body - update in accessibleTasks (optionally tasks if flattened to tasks board) for realtime search
    if (newTask.deletedAt) {
      // Remove from all tasks and accessibleTasks array, if exists
      if (this.tasks.some((task) => task.id === newTask.id)) {
        store.dispatch(setTasks(this.tasks.filter((task) => task.id !== newTask.id)))
      }
      store.dispatch(setAccessibleTasks(this.accessibleTasks.filter((task) => task.id !== newTask.id)))
      return
    }

    if (this.tasks.some((task) => task.id === newTask.id)) {
      store.dispatch(
        setTasks(
          this.tasks.map((task) => {
            return task.id === newTask.id ? { ...newTask, body: newTask.body || task.body } : task
          }),
        ),
      )
    }

    store.dispatch(setAccessibleTasks(this.accessibleTasks))
  }

  /**
   * Handler for realtime subtasks
   */
  handleRealtimeSubtasks() {
    if (!this.isValidPayload()) {
      return
    }

    const newTask = this.payload.new as RealTimeTaskResponse
    // Being a subtask, this surely has a valid non-null parentId
    newTask.parentId = z.string().parse(newTask.parentId)

    if (!this.isTaskAccessible(newTask)) {
      return
    }

    if (this.payload.eventType === 'INSERT') {
      return this.handleRealtimeSubtaskInsert(newTask)
    } else if (this.payload.eventType === 'UPDATE') {
      return this.handleRealtimeSubtaskUpdate(newTask)
    }
  }
}
