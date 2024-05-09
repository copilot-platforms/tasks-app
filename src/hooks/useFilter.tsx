import { applyFilter, selectTaskBoard, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { IFilterOptions } from '@/types/interfaces'
import { Task } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export const useFilter = () => {
  const { tasks, filterOptions } = useSelector(selectTaskBoard)
  useEffect(() => {
    store.dispatch(setTasks(tasks))
    store.dispatch(applyFilter())
  }, [tasks])

  useEffect(() => {
    store.dispatch(applyFilter())
  }, [filterOptions])
}
