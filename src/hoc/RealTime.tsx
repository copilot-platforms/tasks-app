'use client'

import { supabase } from '@/lib/supabase'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
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

export const RealTime = ({ children, task }: { children: ReactNode; task?: TaskResponse }) => {
  const { tasks, token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)
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
      //check if the new task in this event belongs to the same workspaceId
      if (
        payload.new.workspaceId === tokenPayload?.workspaceId &&
        payload.new.assigneeId === userId &&
        payload.new.assigneeType === userRole
      ) {
        store.dispatch(setTasks([...tasks, { ...payload.new, createdAt: new Date(payload.new.createdAt + 'Z') }]))
        // NOTE: we append a Z here to make JS understand this raw timestamp (in format YYYY-MM-DD:HH:MM:SS.MS) is in UTC timezone
        // New payloads listened on the 'INSERT' action in realtime doesn't contain this tz info so the order can mess up
      }
    }
    if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new
      const oldTask = tasks.find((task) => task.id == updatedTask.id)

      if (payload.new.workspaceId === tokenPayload?.workspaceId) {
        //check if the new task in this event belongs to the same workspaceId
        //if the task is deleted
        if (updatedTask.deletedAt) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
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
          if (oldTask && oldTask.body && updatedTask.body) {
            const oldImgSrcs = extractImgSrcs(oldTask.body)
            const newImgSrcs = extractImgSrcs(updatedTask.body)
            // Need to extract new image Srcs and replace it with old ones, because since we are creating a new url of images on each task details navigation,
            // a second user navigating the task details will generate a new src and replace it in the database which causes the previous user to load the src again(because its new)
            if (oldImgSrcs.length > 0 && newImgSrcs.length > 0) {
              updatedTask.body = replaceImgSrcs(updatedTask.body, newImgSrcs, oldImgSrcs)
            }
          }

          const newTaskArr = [...tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
          store.dispatch(setTasks(newTaskArr))
        }
      }
    }
  }

  useEffect(() => {
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
                `assigneeId=eq.${userId}`,
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
