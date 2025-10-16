import { filterOptionsMap } from '@/components/inputs/FilterSelector/FilterAssigneeSection'
import { useFilterBar } from '@/hooks/useFilterBar'
import { CrossIconSmall, FilterByAsigneeIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { FilterType } from '@/types/common'
import { emptyAssignee, getAssigneeName, UserIdsType } from '@/utils/assignee'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import deepEqual from 'deep-equal'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

interface FilterChipProps {
  type: FilterType
  assignee?: UserIdsType
}

export const FilterChip = ({ type, assignee }: FilterChipProps) => {
  const { assignee: assignees } = useSelector(selectTaskBoard)

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

  return (
    <Stack
      direction="row"
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 400,
        lineHeight: '21px',
        height: '32px',
        padding: '2px 8px',
        borderRadius: '4px',
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <FilterByAsigneeIcon />
      <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ color: (theme) => theme.color.text.textSecondary }}>{type}:&nbsp;</Box>
        <Box>
          <Typography
            variant="sm"
            lineHeight="32px"
            sx={{
              color: (theme) => theme.color.gray[600],
              fontWeight: '400',
              textOverflow: 'ellipsis',
              maxWidth: '100px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
            title={name}
          >
            {name}
          </Typography>
        </Box>
      </Stack>
      <IconButton
        aria-label="remove"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleFilterOptionsChange(filterOptionsMap[type], emptyAssignee)
        }}
        sx={{
          cursor: 'default',
          borderRadius: 0,
          padding: '2px',

          '&:hover': {
            bgcolor: (theme) => theme.color.gray[150],
          },
        }}
        disableRipple
        disableTouchRipple
      >
        <CrossIconSmall />
      </IconButton>
    </Stack>
  )
}
