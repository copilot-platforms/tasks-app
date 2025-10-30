import { CopilotChip } from '@/components/atoms/CopilotChip'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { filterOptionsMap } from '@/components/inputs/FilterSelector/FilterAssigneeSection'
import { useFilterBar } from '@/hooks/useFilterBar'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { FilterType } from '@/types/common'
import { FilterOptionsKeywords } from '@/types/interfaces'
import { emptyAssignee, getAssigneeName, UserIdsType } from '@/utils/assignee'
import { getSelectedUserIds } from '@/utils/selector'
import deepEqual from 'deep-equal'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

interface FilterChipProps {
  type: FilterType
  assignee?: UserIdsType
}

export const FilterChip = ({ type, assignee }: FilterChipProps) => {
  const { assignee: assignees, filterOptions } = useSelector(selectTaskBoard)

  const assigneeValue = useMemo(() => {
    if (assignee?.internalUserId) {
      return assignees.find((a) => a.id === assignee.internalUserId)
    } else if (assignee?.clientId && assignee?.companyId) {
      return assignees.find(
        (a) =>
          a.id === assignee.clientId &&
          (a.companyIds?.includes(assignee.companyId || '-') || a.companyId === assignee.companyId),
      )
    } else if (assignee?.companyId && !assignee?.clientId) {
      return assignees.find((a) => a.id === assignee.companyId)
    }
  }, [assignee, assignees])

  const name = useMemo(() => getAssigneeName(assigneeValue), [assigneeValue])

  const { handleFilterOptionsChange } = useFilterBar()

  if (!assignee || deepEqual(assignee, emptyAssignee)) {
    return null
  }

  const hideClientsAndCompanies =
    type === FilterType.Creator || (filterOptions.type === FilterOptionsKeywords.TEAM && type === FilterType.Assignee)
  const hideIus =
    type === FilterType.Visibility || (filterOptions.type === FilterOptionsKeywords.CLIENTS && type === FilterType.Assignee)

  return (
    <>
      <CopilotPopSelector
        hideClientsList={hideClientsAndCompanies}
        hideIusList={hideIus}
        initialValue={assigneeValue}
        buttonContent={
          <CopilotChip
            label={`${type}: ${name}`}
            prefixIcon={'Filter'}
            onClose={() => handleFilterOptionsChange(filterOptionsMap[type], emptyAssignee)}
            className={'filter-chip'}
          />
        }
        name={`Filter by ${type}`}
        onChange={(inputValue) => {
          const newUserIds = getSelectedUserIds(inputValue)
          handleFilterOptionsChange(filterOptionsMap[type], newUserIds)
        }}
        captureClick={false}
      />
    </>
  )
}
