import { CrossIcon } from '@/icons'
import store from '@/redux/store'
import { FilterOptions, IAssigneeCombined } from '@/types/interfaces'
import { Avatar, IconButton, Stack, Typography } from '@mui/material'
import { CopilotAvatar } from '../atoms/CopilotAvatar'

export const FilterByAssigneeBtn = ({
  assigneeValue,
  updateAssigneeValue,
  handleClick,
}: {
  assigneeValue: IAssigneeCombined
  updateAssigneeValue: (newValue: unknown) => void
  handleClick: (optionType: FilterOptions, value: string | null) => void
}) => {
  return (
    <Stack direction="row" alignItems="center" columnGap={1}>
      <Typography variant="sm" lineHeight="32px" sx={{ color: (theme) => theme.color.gray[600] }}>
        Filter by
      </Typography>
      {assigneeValue?.name || assigneeValue?.givenName ? (
        <Stack direction="row" alignItems="center" columnGap={1}>
          <CopilotAvatar currentAssignee={assigneeValue} />
          <Typography
            variant="sm"
            lineHeight="32px"
            sx={{
              color: (theme) => theme.color.gray[600],
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              maxWidth: '90px',
            }}
          >
            {assigneeValue?.name || `${assigneeValue?.givenName ?? ''} ${assigneeValue?.familyName ?? ''}`.trim()}
          </Typography>
          <IconButton
            aria-label="remove"
            onClick={(e) => {
              e.stopPropagation()
              updateAssigneeValue(null)
              handleClick(FilterOptions.ASSIGNEE, '')
            }}
            sx={{ cursor: 'pointer' }}
            disableRipple
            disableTouchRipple
          >
            <CrossIcon />
          </IconButton>
        </Stack>
      ) : (
        <Typography variant="sm" lineHeight="32px" sx={{ color: (theme) => theme.color.gray[600] }}>
          assignee
        </Typography>
      )}
    </Stack>
  )
}
