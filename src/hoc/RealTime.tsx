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
        if (updatedTask.deletedAt) {
          const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
          store.dispatch(setTasks(newTaskArr))
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
