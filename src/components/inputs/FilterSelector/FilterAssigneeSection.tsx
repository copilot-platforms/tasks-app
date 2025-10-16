import { StyledUserCompanySelector } from '@/app/detail/ui/styledComponent'
import { useFilterBar } from '@/hooks/useFilterBar'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { FilterType } from '@/types/common'
import { FilterOptions, InputValue } from '@/types/interfaces'
import { parseAssigneeToSelectorOption } from '@/utils/addTypeToAssignee'
import { getWorkspaceLabels } from '@/utils/getWorkspaceLabels'
import { getSelectedUserIds } from '@/utils/selector'
import { Box } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'
import { useSelector } from 'react-redux'

interface FilterAssigneeSectionProps {
  filterMode: FilterType
  setAnchorEl: Dispatch<SetStateAction<HTMLElement | null>>
}

export const filterOptionsMap = {
  [FilterType.Assignee]: FilterOptions.ASSIGNEE,
  [FilterType.Creator]: FilterOptions.CREATOR,
  [FilterType.Visibility]: FilterOptions.VISIBILITY,
}

export const FilterAssigneeSection = ({ filterMode, setAnchorEl }: FilterAssigneeSectionProps) => {
  const { assignee: assignees } = useSelector(selectTaskBoard)
  const { handleFilterOptionsChange } = useFilterBar()
  const { workspace } = useSelector(selectAuthDetails)

  const selectorAssignees = parseAssigneeToSelectorOption(assignees)

  const handleChange = (inputValue: InputValue[]) => {
    const newUserIds = getSelectedUserIds(inputValue)
    handleFilterOptionsChange(filterOptionsMap[filterMode], newUserIds)
    setAnchorEl(null)
  }

  return (
    <Box>
      <StyledUserCompanySelector
        openMenuOnFocus
        menuIsOpen={true}
        autoFocus
        placeholder={'Search'}
        // initialValue={initialAssignee}
        clientUsers={
          filterMode === FilterType.Assignee || filterMode === FilterType.Visibility ? selectorAssignees.clients : []
        }
        name={'Search'}
        internalUsers={
          filterMode === FilterType.Assignee || filterMode === FilterType.Creator ? selectorAssignees.internalUsers : []
        }
        companies={
          filterMode === FilterType.Assignee || filterMode === FilterType.Visibility ? selectorAssignees.companies : []
        }
        onChange={(inputValue: InputValue[]) => {
          handleChange(inputValue)
        }}
        grouped={true}
        limitSelectedOptions={1}
        customLabels={getWorkspaceLabels(workspace, true)}
      />
    </Box>
  )
}
