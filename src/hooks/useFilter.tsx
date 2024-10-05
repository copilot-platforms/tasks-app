import { selectTaskBoard, setFilteredTasks, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, FilterOptions, FilterOptionsKeywords, IFilterOptions } from '@/types/interfaces'
import { sortTaskByDescendingOrder } from '@/utils/sortTask'
import { Task } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const FilterFunctions = {
  [FilterOptions.ASSIGNEE]: filterByAssignee,
  [FilterOptions.KEYWORD]: filterByKeyword,
  [FilterOptions.TYPE]: filterByType,
}

function filterByAssignee(filteredTasks: TaskResponse[], filterValue: string | null) {
  console.log(
    'sss fbA',
    filteredTasks.map((task) => task.title),
  )
  const assigneeId = filterValue
  filteredTasks =
    assigneeId === 'No assignee'
      ? filteredTasks.filter((task) => !task.assigneeId)
      : filteredTasks.filter((task) => task.assigneeId == assigneeId)
  return filteredTasks as TaskResponse[]
}
function filterByKeyword(filteredTasks: TaskResponse[], filterValue: string) {
  console.log(
    'sss fbK',
    filteredTasks.map((task) => task.title),
  )
  const keyword = (filterValue as string).toLowerCase()
  filteredTasks = filteredTasks.filter(
    (task) => task.title?.toLowerCase().includes(keyword) || task.body?.toLowerCase().includes(keyword),
  )
  return filteredTasks as TaskResponse[]
}
function filterByType(filteredTasks: TaskResponse[], filterValue: string) {
  console.log(
    'sss fbT',
    filteredTasks.map((task) => task.title),
  )
  const assigneeType = filterValue
  filteredTasks = assigneeType.includes('all')
    ? filteredTasks
    : assigneeType == FilterOptionsKeywords.CLIENTS
      ? filteredTasks.filter((task) => task?.assigneeType?.includes('client') || task?.assigneeType?.includes('company'))
      : assigneeType == FilterOptionsKeywords.TEAM
        ? filteredTasks.filter((task) => task?.assigneeType?.includes('internalUser'))
        : filteredTasks.filter((task) => task.assigneeId == assigneeType)

  return filteredTasks as TaskResponse[]
}

export const useFilter = (filterOptions: IFilterOptions) => {
  console.log('useFilter triggered')
  const { tasks } = useSelector(selectTaskBoard)
  console.log('initial first task', tasks[0])

  function applyFilter(tasks: TaskResponse[], filterOptions: IFilterOptions) {
    let filteredTasks = [...tasks]
    for (const [filterType, filterValue] of Object.entries(filterOptions)) {
      console.log('sss filter', filterType, filterValue)
      if (!filterValue) continue
      const filterFn = FilterFunctions[filterType as FilterOptions]
      filteredTasks = filterFn(filteredTasks, filterValue)
      console.log('sss filteredTasks', filteredTasks)
    }
    console.log('final first task', tasks[0])
    store.dispatch(setFilteredTasks(sortTaskByDescendingOrder(filteredTasks)))
  }

  useEffect(() => {
    applyFilter(tasks, filterOptions)
  }, [tasks, filterOptions])
}
