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

interface RealTimeTaskResponse extends TaskResponse {
  deletedAt: string
}

export const RealTime = ({ children }: { children: ReactNode }) => {
  const { tasks, token } = useSelector(selectTaskBoard)
  const pathname = usePathname()
  const router = useRouter()

  const handleTaskRealTimeUpdates = (payload: RealtimePostgresChangesPayload<RealTimeTaskResponse>) => {
    if (payload.eventType === 'INSERT') {
      store.dispatch(setTasks([...tasks, payload.new]))
    }
    if (payload.eventType === 'UPDATE') {
      const updatedTask = payload.new
      //if the task is deleted
      if (updatedTask.deletedAt) {
        const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
        store.dispatch(setTasks(newTaskArr))
        //if a user is in the details page when the task is deleted then we want the user to get redirected to '/' route
        if (pathname.includes('detail')) {
          router.push(`/?token=${token}`)
        }
        //if the task is updated
      } else {
        const newTaskArr = [...tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
        store.dispatch(setTasks(newTaskArr))
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
