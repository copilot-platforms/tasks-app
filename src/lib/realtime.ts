'use client'

import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { selectTaskBoard, setAccessibleTasks, setActiveTask, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { InternalUsersSchema } from '@/types/common'
import { IAssigneeCombined } from '@/types/interfaces'
import { AssigneeType } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { z } from 'zod'

export class RealtimeHandler {
  constructor(
    private readonly payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>,
    private readonly user: IAssigneeCombined,
    private readonly userRole: AssigneeType,
  ) {}

  /**
   * Filters out tasks this user type does not have access to
   */
  private isTaskAccessible(newTask: RealTimeTaskResponse): boolean {
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
    const currentState = store.getState()
    const { tasks, accessibleTasks } = selectTaskBoard(currentState)

    // Check if this new task is a disjoint task by checking if accessible tasks array contains its parent.
    // If it is a disjoint task we need to insert it to the fkin board
    const isParentTaskAccessible = accessibleTasks.some((task) => task.id === newTask.parentId)

    // TODO: @arpandhakal we can implement flattened disjoint tasks for IU (parent is assigned to limited client / company) here
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
      return
    }

    // It's possible that a subtask exists in `tasks` because it can be a disjoint task, update it
    if (isTaskVisibleInBoard) {
      store.dispatch(
        setTasks(
          tasks.map((task) => {
            return task.id === newTask.id
              ? // Update task - account for TOAST behavior in `body`, and format realtime postgres' timestamp
                { ...newTask, body: newTask.body || task.body, createdAt: new Date(newTask.createdAt + 'Z') }
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
          const { id, title, assigneeId, assigneeType, parentId } = newTask
          return task.id === newTask.id
            ? { id, assigneeId, assigneeType, parentId, title, body: newTask.body || task.body }
            : task
        }),
      ),
    )
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
