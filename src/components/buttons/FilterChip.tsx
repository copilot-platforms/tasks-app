import { CrossIcon, FilterByAsigneeIcon } from '@/icons'
import { FilterType } from '@/types/common'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

interface FilterChipProps {
  type: FilterType
  assigneeValue?: IAssigneeCombined
}

export const FilterChip = ({ type, assigneeValue }: FilterChipProps) => {
  const name = useMemo(() => getAssigneeName(assigneeValue), [assigneeValue])

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
        }}
        sx={{
          cursor: 'default',
          borderRadius: 0,
          padding: '6px 5px 6px 6px',

          '&:hover': {
            bgcolor: (theme) => theme.color.text.textSecondary,
          },
        }}
        disableRipple
        disableTouchRipple
      >
        <CrossIcon />
      </IconButton>
    </Stack>
  )
}
