import { selectTaskBoard, setFilteredTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { AccessibleTasksResponse, TaskResponse } from '@/types/dto/tasks.dto'
import { FilterOptions, FilterOptionsKeywords, IFilterOptions } from '@/types/interfaces'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

interface KeywordMatchable {
  title?: string
  body?: string
}

const FilterFunctions = {
  [FilterOptions.ASSIGNEE]: filterByAssignee,
  [FilterOptions.KEYWORD]: filterByKeyword,
  [FilterOptions.TYPE]: filterByType,
}

function filterByAssignee(filteredTasks: TaskResponse[], filterValue: string | null): TaskResponse[] {
  const assigneeId = filterValue
  filteredTasks =
    assigneeId === 'No assignee'
      ? filteredTasks.filter((task) => !task.assigneeId)
      : filteredTasks.filter((task) => task.assigneeId == assigneeId)
  return filteredTasks
}

function filterByKeyword(
  filteredTasks: TaskResponse[],
  filterValue: string,
  accessibleTasks?: AccessibleTasksResponse[],
): TaskResponse[] {
  const keyword = (filterValue as string).toLowerCase()
  const matchKeyword = (task: KeywordMatchable) =>
    task.title?.toLowerCase().includes(keyword) || task.body?.toLowerCase().includes(keyword) || false

  const keywordMatchingParentIds = accessibleTasks?.filter(matchKeyword).map((task) => task.parentId) || []
  filteredTasks = filteredTasks.filter((task) => matchKeyword(task) || keywordMatchingParentIds.includes(task.id))
  return filteredTasks
}

function filterByType(filteredTasks: TaskResponse[], filterValue: string): TaskResponse[] {
  const assigneeType = filterValue
  filteredTasks = assigneeType.includes('all')
    ? filteredTasks
    : assigneeType == FilterOptionsKeywords.CLIENTS
      ? filteredTasks.filter((task) => task?.assigneeType?.includes('client') || task?.assigneeType?.includes('company'))
      : assigneeType == FilterOptionsKeywords.TEAM
        ? filteredTasks.filter((task) => task?.assigneeType?.includes('internalUser'))
        : filteredTasks.filter((task) => task.assigneeId == assigneeType)

  return filteredTasks
}

export const useFilter = (filterOptions: IFilterOptions) => {
  const { tasks, accessibleTasks } = useSelector(selectTaskBoard)

  function applyFilter(tasks: TaskResponse[], filterOptions: IFilterOptions) {
    let filteredTasks = [...tasks]
    for (const [filterType, filterValue] of Object.entries(filterOptions)) {
      if (!filterValue) continue
      const filterFn = FilterFunctions[filterType as FilterOptions]
      filteredTasks = filterFn(filteredTasks, filterValue, accessibleTasks)
    }
    store.dispatch(setFilteredTasks(filteredTasks))
  }

  useEffect(() => {
    applyFilter(tasks, filterOptions)
  }, [tasks, filterOptions])
}
