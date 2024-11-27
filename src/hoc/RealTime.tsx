'use client'

import { UserRole } from '@/app/api/core/types/user'
import { supabase } from '@/lib/supabase'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard, setBackupTasks, setFilteredTasks, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { extractImgSrcs, replaceImgSrcs } from '@/utils/signedUrlReplacer'
import { AssigneeType } from '@prisma/client'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

interface RealTimeTaskResponse extends TaskResponse {
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
  const { tasks, token, backupTasks } = useSelector(selectTaskBoard)
  const { showUnarchived, showArchived } = useSelector(selectTaskBoard)
  const pathname = usePathname()
  const router = useRouter()

  const userId = tokenPayload?.internalUserId || tokenPayload?.clientId
  const userRole = tokenPayload?.internalUserId
    ? AssigneeType.internalUser
    : tokenPayload?.clientId
      ? AssigneeType.client
      : undefined

  if (!userId || !userRole) {
    console.error(`Failed to authenticate a realtime connection for id ${userId} with role ${userRole}`)
  }

  const handleTaskRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
    if (payload.eventType === 'INSERT') {
      // For both user types, filter out just tasks belonging to workspace.
      let canUserAccessTask = payload.new.workspaceId === tokenPayload?.workspaceId
      // Additionally, if user is a client, it can only access tasks assigned to that client or the client's company
      if (userRole === AssigneeType.client) {
        canUserAccessTask = canUserAccessTask && [userId, tokenPayload?.companyId].includes(payload.new.assigneeId)
      }
      //check if the new task in this event belongs to the same workspaceId
      if (canUserAccessTask && showUnarchived) {
        store.dispatch(setTasks([...tasks, { ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') }]))
        store.dispatch(
          setBackupTasks([...backupTasks, { ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') }]),
        )

        // NOTE: we append a Z here to make JS understand this raw timestamp (in format YYYY-MM-DD:HH:MM:SS.MS) is in UTC timezone
        // New payloads listened on the 'INSERT' action in realtime doesn't contain this tz info so the order can mess up
      }
    }
    if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new
      const oldTask = backupTasks.find((task) => task.id == updatedTask.id)

      if (payload.new.workspaceId === tokenPayload?.workspaceId) {
        //check if the new task in this event belongs to the same workspaceId
        //if the task is deleted
        if (updatedTask.deletedAt) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          const backupTaskArr = backupTasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
          store.dispatch(setBackupTasks(backupTaskArr))

          //if a user is in the details page when the task is deleted then we want the user to get redirected to '/' route
          if (pathname.includes('detail')) {
            if (pathname.includes('cu')) {
              router.push(`/client?token=${token}`)
            } else {
              router.push(`/?token=${token}`)
            }
          }
          //if the task is updated
        } else {
          // Address Postgres' 8kb pagesize limitation (See TOAST https://www.postgresql.org/docs/current/storage-toast.html)
          // If `body` field (which can be larger than pagesize) is not changed, Supabase Realtime won't send large fields like this in `payload.new`

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
            const backupTaskArr = [...backupTasks.filter((task) => task.id !== updatedTask.id), updatedTask]
            store.dispatch(setBackupTasks(backupTaskArr))
            store.dispatch(setTasks(tasks.filter((el) => el.id !== updatedTask.id)))
            return
          }
          const newTaskArr = [...tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
          const backupTaskArr = [...backupTasks.filter((task) => task.id !== updatedTask.id), updatedTask]
          store.dispatch(setTasks(newTaskArr))
          store.dispatch(setBackupTasks(backupTaskArr))
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
          filter:
            userRole === AssigneeType.internalUser
              ? `workspaceId=eq.${tokenPayload?.workspaceId}`
              : // The reason we are explicitly using an assigneeId filter for clients is so they are not streamed
                // tasks they don't have access to in the first place.
                `assigneeId=in.(${userId}, ${tokenPayload.companyId})`,
        },
        handleTaskRealTimeUpdates,
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tasks])

  return children
}
