'use client'

import { supabase } from '@/lib/supabase'
import { selectTaskBoard, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

interface RealTimeTaskResponse extends TaskResponse {
  deletedAt: string
}

export const RealTime = ({ children }: { children: ReactNode }) => {
  const { tasks } = useSelector(selectTaskBoard)

  useEffect(() => {
    // Listen to inserts
    if (!tasks || tasks.length === 0) return
    const channel = supabase
      .channel('realtime tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          store.dispatch(setTasks([...tasks, payload.new as TaskResponse]))
        }
        if (payload.eventType === 'UPDATE') {
          const updatedTask = payload.new as RealTimeTaskResponse
          const _tasks = [...tasks]
          if (updatedTask.deletedAt) {
            const newTaskArr = tasks.filter((el) => el.id !== updatedTask.id)
            store.dispatch(setTasks(newTaskArr))
          } else {
            const newTaskArr = [..._tasks.filter((task) => task.id !== updatedTask.id), updatedTask]
            store.dispatch(setTasks(newTaskArr))
          }
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tasks])

  return children
}
