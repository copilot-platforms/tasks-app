'use client'

import { supabase } from '@/lib/supabase'
import { selectTaskBoard, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { RESOURCE_NOT_FOUND_REDIRECT_PATHS } from '@/utils/redirect'
import { UserType } from '@/types/interfaces'

interface RealTimeTaskResponse extends TaskResponse {
  deletedAt: string
}

export const RealTime = ({ children }: { children: ReactNode }) => {
  const { tasks, token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const pathname = usePathname()
  const router = useRouter()

  const handleTaskRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
    if (payload.eventType === 'INSERT') {
      //check if the new task in this event belongs to the same workspaceId
      if (payload.new.workspaceId === tokenPayload?.workspaceId) {
        store.dispatch(setTasks([...tasks, payload.new]))
      }
    }
    if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new
      //check if the new task in this event belongs to the same workspaceId
      if (payload.new.workspaceId === tokenPayload?.workspaceId) {
        //if the task is deleted
        // This solution is good but causes all active users, even those that don't have that task open to
        if (updatedTask.deletedAt) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
          // //if a user is in the details page when the task is deleted then we want the user to get redirected to '/' route
          // if (pathname.includes('detail')) {
          //   router.push(
          //     `${RESOURCE_NOT_FOUND_REDIRECT_PATHS[tokenPayload.internalUserId ? UserType.INTERNAL_USER : UserType.CLIENT_USER]}?token=${token}`,
          //   )
          // }
        } else {
          const newTaskArr = [...tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
          store.dispatch(setTasks(newTaskArr))
        }
      }
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('realtime tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tasks' }, handleTaskRealTimeUpdates)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tasks])

  return children
}
