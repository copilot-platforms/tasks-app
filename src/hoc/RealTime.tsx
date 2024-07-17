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
          let _tasks = [...tasks]
          if (updatedTask.deletedAt) {
            _tasks = tasks.filter((el) => el.id !== updatedTask.id)
          }
          for (let i = 0; i < _tasks.length; i++) {
            if (_tasks[i].id === updatedTask.id) {
              _tasks[i] = updatedTask
              break // Exit the loop once the match is found and replaced
            }
          }
          store.dispatch(setTasks(_tasks))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, tasks])

  return children
}
