import { FilterChip } from '@/components/buttons/FilterChip'
import { SelectorButton } from '@/components/buttons/SelectorButton'
import { CopilotPopSelector } from '@/components/inputs/CopilotSelector'
import { useFilterBar } from '@/hooks/useFilterBar'
import { FilterByAsigneeIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { FilterType } from '@/types/common'
import { FilterOptions, FilterOptionsKeywords, IAssigneeCombined } from '@/types/interfaces'
import { emptyAssignee, getAssigneeId } from '@/utils/assignee'
import { getSelectedUserIds, getSelectorAssignee } from '@/utils/selector'
import { UserRole } from '@api/core/types/user'
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'

interface SecondaryFilterBarProps {
  mode: UserRole
}

export const SecondaryFilterBar = ({ mode }: SecondaryFilterBarProps) => {
  const { filterOptions, assignee } = useSelector(selectTaskBoard)
  const { handleFilterOptionsChange } = useFilterBar()

  const [assigneeValue, setAssigneeValue] = useState<IAssigneeCombined | undefined>()

  const SelectorButtonContent = () => {
    return (
      <SelectorButton
        startIcon={<FilterByAsigneeIcon />}
        buttonContent={
          <Stack direction="row" alignItems="center" columnGap={1}>
            <Typography
              variant="sm"
              lineHeight="32px"
              sx={{
                color: (theme) => theme.color.text.textSecondary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Filter
            </Typography>
          </Stack>
        }
        sx={(theme) => ({
          background: theme.color.gray[100],
          borderColor: theme.color.gray[150],
        })}
      />
    )
  }

  return (
    <Stack direction="row" gap={'8px'} sx={{ padding: '12px 20px' }}>
      {assigneeValue && <FilterChip type={FilterType.Assignee} assigneeValue={assigneeValue} />}
      {mode === UserRole.IU && (
        <Box>
          <CopilotPopSelector
            hideClientsList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.TEAM}
            hideIusList={filterOptions[FilterOptions.TYPE] === FilterOptionsKeywords.CLIENTS}
            initialValue={assigneeValue}
            buttonContent={<SelectorButtonContent />}
            name="Search"
            onChange={(inputValue) => {
              const newUserIds = getSelectedUserIds(inputValue)
              const newAssignee = getAssigneeId(newUserIds)
              if (newAssignee) {
                setAssigneeValue(getSelectorAssignee(assignee, inputValue))
                handleFilterOptionsChange(FilterOptions.ASSIGNEE, newUserIds)
              } else {
                setAssigneeValue(undefined)
                handleFilterOptionsChange(FilterOptions.ASSIGNEE, emptyAssignee)
              }
            }}
            captureClick={false}
          />
        </Box>
      )}
    </Stack>
  )
}
