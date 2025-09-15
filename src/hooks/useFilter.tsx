import { selectTaskBoard, setFilteredTasks } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { FilterOptions, FilterOptionsKeywords, IAssigneeCombined, IFilterOptions, UserIds } from '@/types/interfaces'
import { checkEmptyAssignee, getAssigneeName, UserIdsSchema, UserIdsType } from '@/utils/assignee'
import { useEffect, useTransition } from 'react'
import { useSelector } from 'react-redux'

interface KeywordMatchable {
  title?: string
  body?: string
  label?: string
  assigneeId?: string
  internalUserId?: string | null
  clientId?: string | null
  companyId?: string | null
}

const FilterFunctions = {
  [FilterOptions.ASSIGNEE]: filterByAssignee,
  [FilterOptions.KEYWORD]: filterByKeyword,
  [FilterOptions.TYPE]: filterByType,
}

function filterByAssignee(filteredTasks: TaskResponse[], filterValue: UserIdsType): TaskResponse[] {
  const assigneeUserIds = filterValue

  if (checkEmptyAssignee(assigneeUserIds)) {
    return filteredTasks
  }
  const {
    [UserIds.INTERNAL_USER_ID]: internalUserId,
    [UserIds.CLIENT_ID]: clientId,
    [UserIds.COMPANY_ID]: companyId,
  } = assigneeUserIds

  if (internalUserId === 'No assignee') {
    //Change this when UserCompanySelector supports extra options for 'No assignee'
    filteredTasks = filteredTasks.filter((task) => !task.assigneeId)
  } else if (internalUserId) {
    filteredTasks = filteredTasks.filter((task) => task.internalUserId === internalUserId)
  } else if (clientId) {
    filteredTasks = filteredTasks.filter((task) => task.clientId === clientId && task.companyId === companyId)
  } else {
    filteredTasks = filteredTasks.filter((task) => task.companyId === companyId)
  }

  return filteredTasks
}

function filterByKeyword(
  filteredTasks: TaskResponse[],
  filterValue: string,
  accessibleTasks?: TaskResponse[],
  assignee?: IAssigneeCombined[],
): TaskResponse[] {
  const keyword = filterValue.toLowerCase()

  const assigneeNameMap = new Map(assignee?.map((a) => [a.id, getAssigneeName(a)?.toLowerCase() ?? '']) ?? [])

  const matchKeyword = (task: KeywordMatchable) => {
    const assigneeMatches = [task.assigneeId, task.companyId]
      .map((id) => assigneeNameMap.get(id || ''))
      .filter(Boolean)
      .some((name) => name && name.includes(keyword))

    return (
      task.title?.toLowerCase().includes(keyword) ||
      task.body?.toLowerCase().includes(keyword) ||
      task.label?.toLowerCase().includes(keyword) ||
      assigneeMatches
    )
  }

  const keywordMatchingParentIds = new Set(
    accessibleTasks
      ?.filter(matchKeyword)
      .map((task) => task.parentId)
      .filter(Boolean),
  )

  return filteredTasks.filter((task) => matchKeyword(task) || keywordMatchingParentIds.has(task.id))
}

function filterByType(filteredTasks: TaskResponse[], filterValue: string): TaskResponse[] {
  const assigneeType = filterValue
  filteredTasks = assigneeType.includes('all')
    ? filteredTasks
    : assigneeType == FilterOptionsKeywords.CLIENTS
      ? filteredTasks.filter((task) => task?.assigneeType?.includes('client') || task?.assigneeType?.includes('company')) // show shared tasks
      : assigneeType == FilterOptionsKeywords.CLIENT_WITH_VIEWERS
        ? filteredTasks.filter(
            (task) =>
              !!task?.viewers?.length || task?.assigneeType?.includes('client') || task?.assigneeType?.includes('company'),
          )
        : assigneeType == FilterOptionsKeywords.TEAM
          ? filteredTasks.filter((task) => task?.assigneeType?.includes('internalUser'))
          : filteredTasks.filter((task) => task.assigneeId == assigneeType)

  return filteredTasks
}

export const useFilter = (filterOptions: IFilterOptions) => {
  const { tasks, accessibleTasks, assignee } = useSelector(selectTaskBoard)
  const [isPending, startTransition] = useTransition()

  function applyFilter(tasks: TaskResponse[], filterOptions: IFilterOptions) {
    let filteredTasks = [...tasks]
    for (const [filterType, filterValue] of Object.entries(filterOptions)) {
      if (!filterValue) continue
      if (filterType === FilterOptions.ASSIGNEE) {
        const assigneeFilterValue = UserIdsSchema.parse(filterValue)
        filteredTasks = FilterFunctions[FilterOptions.ASSIGNEE](filteredTasks, assigneeFilterValue)
      } else if (filterType === FilterOptions.KEYWORD) {
        filteredTasks = FilterFunctions[FilterOptions.KEYWORD](
          filteredTasks,
          filterValue as string,
          accessibleTasks,
          assignee,
        )
      } else if (filterType === FilterOptions.TYPE) {
        filteredTasks = FilterFunctions[FilterOptions.TYPE](filteredTasks, filterValue as string)
      }
    }
    startTransition(() => {
      store.dispatch(setFilteredTasks(filteredTasks))
    })
  }

  useEffect(() => {
    applyFilter(tasks, filterOptions)
  }, [tasks, filterOptions])
}
