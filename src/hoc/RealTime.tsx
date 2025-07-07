'use client'

import { RealtimeHandler } from '@/lib/realtime'
import { supabase } from '@/lib/supabase'
import {
  selectTaskBoard,
  setAccesibleTaskIds,
  setAccessibleTasks,
  setActiveTask,
  setTasks,
} from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { InternalUsersSchema, Token } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { extractImgSrcs, replaceImgSrcs } from '@/utils/signedUrlReplacer'
import { AssigneeType } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { shallowEqual, useSelector } from 'react-redux'

export interface RealTimeTaskResponse extends TaskResponse {
  assigneeId: string
  assigneeType: AssigneeType
  parentId: string | null
  deletedAt: string
}

export const RealTime = ({
  children,
  task,
  tokenPayload,
}: {
  children: ReactNode
  task?: TaskResponse
  tokenPayload: Token
}) => {
  const { tasks, accessibleTasks, token, activeTask, assignee, accesibleTaskIds } = useSelector(selectTaskBoard)
  const { showUnarchived, showArchived } = useSelector(selectTaskBoard)
  const pathname = usePathname()
  const router = useRouter()

  const userId = tokenPayload?.clientId || tokenPayload?.companyId || tokenPayload?.internalUserId
  const userRole = tokenPayload?.companyId
    ? AssigneeType.client
    : tokenPayload?.internalUserId
      ? AssigneeType.internalUser
      : undefined

  if (!tokenPayload || !userId || !userRole) {
    console.error(`Failed to authenticate a realtime connection for id ${userId} with role ${userRole}`)
  }

  const redirectToBoard = (updatedTask: RealTimeTaskResponse) => {
    if (!pathname.includes('detail')) return

    const isClientUser = pathname.includes('cu')
    const isAccessibleSubtask = updatedTask.parentId && accessibleTasks.some((task) => task.id === updatedTask.parentId)

    if (isClientUser) {
      router.push(isAccessibleSubtask ? `/detail/${updatedTask.parentId}/cu?token=${token}` : `/client?token=${token}`)
    } else {
      router.push(isAccessibleSubtask ? `/detail/${updatedTask.parentId}/iu/?token=${token}` : `/?token=${token}`)
    }
  }

  const handleTaskRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
    const user = assignee.find((el) => el.id === userId)
    if (!user || !userRole) return

    // Handle realtime subtasks in a modular way
    // TODO: Handle rest of the realtime operations in the same way in a TDB milestone
    const realtimeHandler = new RealtimeHandler(payload, user, userRole, redirectToBoard)
    if (Object.keys(payload.new).includes('parentId') && (payload.new as RealTimeTaskResponse).parentId !== null) {
      return realtimeHandler.handleRealtimeSubtasks()
    }

    // TODO: Refactor all of this
    if (payload.eventType === 'INSERT') {
      // For both user types, filter out just tasks belonging to workspace.
      // NOTE: This is not needed any more since we run `eq.${tokenPayload?.workspaceId}` in POSTGRES_CHANGES filter
      let canUserAccessTask = payload.new.workspaceId === tokenPayload?.workspaceId

      // If user is an internal user with client access limitations, they can only access tasks assigned to clients or company they have access to
      if (user && userRole === AssigneeType.internalUser && InternalUsersSchema.parse(user).isClientAccessLimited) {
        const assigneeSet = new Set(assignee.map((a) => a.id))
        canUserAccessTask = canUserAccessTask && (payload.new.assigneeId ? assigneeSet.has(payload.new.assigneeId) : false) //filtering out unassigned tasks with a fallback false value.
        // NOTE: isSubtask will never be true since `handleRealtimeSubtasks` takes care of it elsewhere
        const isSubtask = payload.new.parentId && accesibleTaskIds.find((id) => id === payload.new.parentId) // dont append task into task list if its a subtask
        if (canUserAccessTask) {
          // @deprecated - use of accessibleTasks is preferred
          store.dispatch(setAccesibleTaskIds([...accesibleTaskIds, payload.new.id]))
          store.dispatch(setAccessibleTasks([...accessibleTasks, payload.new]))
        }
        canUserAccessTask = canUserAccessTask && !isSubtask
      }
      if (user && userRole === AssigneeType.internalUser && !InternalUsersSchema.parse(user).isClientAccessLimited) {
        const isSubtask = !!payload.new.parentId
        canUserAccessTask = canUserAccessTask && !isSubtask
      }
      // Additionally, if user is a client, it can only access tasks assigned to that client or the client's company
      if (userRole === AssigneeType.client) {
        canUserAccessTask = canUserAccessTask && [userId, tokenPayload?.companyId].includes(payload.new.assigneeId)
        const isSubtask = payload.new.parentId && accesibleTaskIds.find((id) => id === payload.new.parentId)
        if (canUserAccessTask) {
          // @deprecated - use of accessibleTasks is preferred
          store.dispatch(setAccesibleTaskIds([...accesibleTaskIds, payload.new.id]))
          store.dispatch(setAccessibleTasks([...accessibleTasks, payload.new]))
        }

        canUserAccessTask = canUserAccessTask && !isSubtask
      }

      //check if the new task in this event belongs to the same workspaceId
      if (canUserAccessTask && showUnarchived) {
        store.dispatch(
          setTasks([
            // Remove any previously disjointed tasks from the board
            ...tasks.filter((task) => task.parentId !== payload.new.id),
            { ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') },
          ]),
        )
        // NOTE: we append a Z here to make JS understand this raw timestamp (in format YYYY-MM-DD:HH:MM:SS.MS) is in UTC timezone
        // New payloads listened on the 'INSERT' action in realtime doesn't contain this tz info so the order can mess up
      }
    }

    if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new
      // if (updatedTask.parentId && tasks.find((task) => task.id === updatedTask.parentId)) {
      //   return //short circuit if the updated task is a subtask and its parent id is in the tasks array
      // }

      // --- Handle unassignment (board + details page)
      if (user && userRole === AssigneeType.client) {
        // Check if assignee is this client's ID, or it's company's ID
        if (![userId, tokenPayload?.companyId].includes(updatedTask.assigneeId)) {
          // Get the previous task from tasks array and check if it was previously assigned to this client

          const task = tasks.find((task) => task.id === updatedTask.id)
          if (!task) {
            return
          }
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          // Check if any disjoint children were created
          const newlyDisjointChildren = accessibleTasks.filter((task) => task.parentId === updatedTask.id)
          newlyDisjointChildren.length && newTaskArr.push(...newlyDisjointChildren)

          store.dispatch(setTasks(newTaskArr))
          store.dispatch(setAccesibleTaskIds(accesibleTaskIds.filter((id) => id !== updatedTask.id)))
          store.dispatch(setAccessibleTasks(accessibleTasks.filter((task) => task.id !== updatedTask.id)))

          if (updatedTask.id === activeTask?.id) {
            return redirectToBoard(updatedTask)
          }

          return
        }
      }

      //if the updated task is out of scope for limited access iu
      if (user && userRole === AssigneeType.internalUser && InternalUsersSchema.parse(user).isClientAccessLimited) {
        const assigneeSet = new Set(assignee.map((a) => a.id))
        if (updatedTask.assigneeId && !assigneeSet.has(updatedTask.assigneeId)) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
          store.dispatch(setAccesibleTaskIds(accesibleTaskIds.filter((id) => id !== updatedTask.id)))
          store.dispatch(setAccessibleTasks(accessibleTasks.filter((task) => task.id !== updatedTask.id)))
          if (updatedTask.id === activeTask?.id) {
            redirectToBoard(updatedTask)
          }
          return
        }
      }

      const isCreatedAtGMT = (updatedTask.createdAt as unknown as string).slice(-1).toLowerCase() === 'z'
      if (!isCreatedAtGMT) {
        // DB stores GMT timestamp without 'z', so need to append this manually
        updatedTask.createdAt = ((updatedTask.createdAt as unknown as string) + 'Z') as unknown as Date
        // This casting is safe
      }
      const oldTask =
        activeTask && updatedTask.id === activeTask.id ? activeTask : tasks.find((task) => task.id == updatedTask.id)

      //check if the new task in this event belongs to the same workspaceId
      if (updatedTask.workspaceId === tokenPayload?.workspaceId) {
        //if the task is deleted
        if (updatedTask.deletedAt) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
          store.dispatch(setAccesibleTaskIds(accesibleTaskIds.filter((id) => id !== updatedTask.id)))
          store.dispatch(setAccessibleTasks(accessibleTasks.filter((task) => task.id !== updatedTask.id)))
          //if a user is in the details page when the task is deleted then we want the user to get redirected to '/' route
          if (updatedTask.id === activeTask?.id) {
            redirectToBoard(updatedTask)
          }
          //if the task is updated
        } else {
          // Address Postgres' TOAST limitation that causes fields like TEXT, BYTEA to be copied as a pointer, instead of copying template field in realtime replica
          // (See TOAST https://www.postgresql.org/docs/current/storage-toast.html)
          // If `body` field (which *can* be toasted) is not changed, Supabase Realtime won't send large fields like this in `payload.new`

          // So, we need to check if the oldTask has valid body but new body field is not being sent in updatedTask, and add it if required
          if (oldTask?.body && updatedTask.body === undefined) {
            updatedTask.body = oldTask?.body
          }
          if (oldTask && oldTask.body && updatedTask.body) {
            const oldImgSrcs = extractImgSrcs(oldTask.body)
            const newImgSrcs = extractImgSrcs(updatedTask.body)
            // Need to extract new image Srcs and replace it with old ones, because since we are creating a new url of images on each task details navigation,
            // a second user navigating the task details will generate a new src and replace it in the database which causes the previous user to load the src again(because its new)
            if (oldImgSrcs.length > 0 && newImgSrcs.length > 0) {
              updatedTask.body = replaceImgSrcs(updatedTask.body, newImgSrcs, oldImgSrcs)
            }
          }
          if ((updatedTask.isArchived && !showArchived) || (!updatedTask.isArchived && !showUnarchived)) {
            if (activeTask && activeTask.id === updatedTask.id) {
              store.dispatch(setActiveTask(updatedTask))
            }
            store.dispatch(setTasks(tasks.filter((el) => el.id !== updatedTask.id)))
            return
          }
          const newTaskArr = [...tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
          const shouldUpdateTasksOnBoard = () => {
            if (user && userRole === AssigneeType.internalUser && !InternalUsersSchema.parse(user).isClientAccessLimited) {
              if (updatedTask.parentId) {
                return false
              }
            }
            if (user && userRole === AssigneeType.internalUser && InternalUsersSchema.parse(user).isClientAccessLimited) {
              if (updatedTask.parentId && accesibleTaskIds.includes(updatedTask.parentId)) {
                return false
              }
            }
            if (user && userRole === AssigneeType.client) {
              if (updatedTask.parentId && accesibleTaskIds.includes(updatedTask.parentId)) {
                return false
              }
            }
            return true
          } // returns false if the currently updatedTask is a subtask

          if (!shallowEqual(tasks, newTaskArr) && shouldUpdateTasksOnBoard()) {
            // Remove previously disjointed tasks on reassignment
            store.dispatch(setTasks(newTaskArr.filter((task) => task.parentId !== updatedTask.id)))
          }
          if (activeTask && activeTask.id === updatedTask.id) {
            store.dispatch(setActiveTask(updatedTask))
          }

          // If there are disjoint child tasks floating around in the task board
          if (tasks.some((task) => task.parentId === updatedTask.id)) {
            store.dispatch(setTasks(tasks.filter((task) => task.parentId !== updatedTask.id)))
          }
        }
      }
    }
  }

  useEffect(() => {
    if (!userId || !userRole) {
      // Don't try to open a connection with `undefined` parameters
      return
    }

    const channel = supabase
      .channel('realtime tasks')
      .on(
        'postgres_changes',
        // Because of the way supabase realtime is architected for postgres_changes, it can only apply one filter at a time.
        // Ref: https://github.com/supabase/realtime-js/issues/97
        {
          event: '*',
          schema: 'public',
          table: 'Tasks',
          filter: `workspaceId=eq.${tokenPayload?.workspaceId}`,
        },
        handleTaskRealTimeUpdates,
      )
      .subscribe()
    // console.info('Connected to realtime channel', channel)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tasks, assignee])

  return children
}
