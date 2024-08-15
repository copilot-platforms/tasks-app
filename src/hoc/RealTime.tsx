'use client'

import { supabase } from '@/lib/supabase'
import { selectTaskBoard, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { usePathname } from 'next/navigation'
import { selectTaskDetails, setTask } from '@/redux/features/taskDetailsSlice'
import { useRouter } from 'next/navigation'

interface RealTimeTaskResponse extends TaskResponse {
  deletedAt: string
}

export const RealTime = ({ children }: { children: ReactNode }) => {
  const { tasks, token } = useSelector(selectTaskBoard)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { task } = useSelector(selectTaskDetails)
  const path = usePathname()
  const router = useRouter()

  const handleTaskRealTimeUpdatesInRoot = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
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
  const handleTaskRealTimeUpdatesDetails = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
    const updatedTask = payload.new as RealTimeTaskResponse
    if (updatedTask.deletedAt) {
      if (path.includes('/iu')) {
        router.push(`/?token=${token}`)
      } else {
        router.push(`/client?token=${token}`)
      }
    } else {
      store.dispatch(setTask(updatedTask))
    }
  }

  useEffect(() => {
    if (path.includes('/detail') && task) {
      const channel = supabase
        .channel('realtime tasks details')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'Tasks',
            filter: `id=eq.${task.id}`,
          },
          handleTaskRealTimeUpdatesDetails,
        )
        .subscribe()
      return () => {
        supabase.removeChannel(channel)
      }
    } else {
      const channel = supabase
        .channel('realtime tasks')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'Tasks' }, handleTaskRealTimeUpdatesInRoot)
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [supabase, tasks, path, task])

  return children
}
