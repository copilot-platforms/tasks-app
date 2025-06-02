import { selectTaskBoard, setFilteredTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { FilterOptions, FilterOptionsKeywords, IAssigneeCombined, IFilterOptions } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

interface KeywordMatchable {
  title?: string
  body?: string
  label?: string
  assigneeId?: string
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
  accessibleTasks?: TaskResponse[],
  assignee?: IAssigneeCombined[],
): TaskResponse[] {
  const keyword = (filterValue as string).toLowerCase()
  const matchKeyword = (task: KeywordMatchable) =>
    // Match title, body or task label (case-insensitive)
    task.title?.toLowerCase().includes(keyword) ||
    task.body?.toLowerCase().includes(keyword) ||
    task.label?.toLowerCase().includes(keyword) ||
    getAssigneeName(assignee?.find((el) => el.id === task.assigneeId)) //also match assignee name
      ?.toLowerCase()
      .includes(keyword) ||
    false

  const keywordMatchingParentIds = accessibleTasks?.filter(matchKeyword).map((task) => task.parentId) || []
  filteredTasks = filteredTasks.filter((task) => {
    // Either match parent with keyword, or match child task with keyword and link it to its parentId
    return matchKeyword(task) || keywordMatchingParentIds.includes(task.id)
  })

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
  const { tasks, accessibleTasks, assignee } = useSelector(selectTaskBoard)

  function applyFilter(tasks: TaskResponse[], filterOptions: IFilterOptions) {
    let filteredTasks = [...tasks]
    for (const [filterType, filterValue] of Object.entries(filterOptions)) {
      if (!filterValue) continue
      const filterFn = FilterFunctions[filterType as FilterOptions]
      filteredTasks = filterFn(filteredTasks, filterValue, accessibleTasks, assignee)
    }
    store.dispatch(setFilteredTasks(filteredTasks))
  }

  useEffect(() => {
    applyFilter(tasks, filterOptions)
  }, [tasks, filterOptions])
}
