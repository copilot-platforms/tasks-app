import { selectTaskBoard, setFilteredTasks, setTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { AssigneeType, FilterOptions, FilterOptionsKeywords, IFilterOptions } from '@/types/interfaces'
import { Task } from '@prisma/client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const FilterFunctions = {
  [FilterOptions.ASSIGNEE]: filterByAssignee,
  [FilterOptions.KEYWORD]: filterByKeyword,
  [FilterOptions.TYPE]: filterByType,
}

function filterByAssignee(filteredTasks: TaskResponse[], filterValue: string | null) {
  const assigneeId = filterValue
  filteredTasks =
    assigneeId === 'No assignee'
      ? filteredTasks.filter((task) => !task.assigneeId)
      : filteredTasks.filter((task) => task.assigneeId == assigneeId)
  return filteredTasks as TaskResponse[]
}
function filterByKeyword(filteredTasks: TaskResponse[], filterValue: string) {
  const keyword = (filterValue as string).toLowerCase()
  filteredTasks = filteredTasks.filter(
    (task) => task.title?.toLowerCase().includes(keyword) || task.body?.toLowerCase().includes(keyword),
  )
  return filteredTasks as TaskResponse[]
}
function filterByType(filteredTasks: TaskResponse[], filterValue: string) {
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
  const { tasks } = useSelector(selectTaskBoard)

  function applyFilter(tasks: TaskResponse[], filterOptions: IFilterOptions) {
    let filteredTasks = [...tasks]
    for (const [filterType, filterValue] of Object.entries(filterOptions)) {
      if (!filterValue) continue
      const filterFn = FilterFunctions[filterType as FilterOptions]
      filteredTasks = filterFn(filteredTasks, filterValue)
    }
    store.dispatch(setFilteredTasks(filteredTasks))
  }

  useEffect(() => {
    applyFilter(tasks, filterOptions)
  }, [tasks, filterOptions])
}
