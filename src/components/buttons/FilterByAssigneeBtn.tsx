import { CrossIcon } from '@/icons'
import store from '@/redux/store'
import { FilterOptions, IAssigneeCombined } from '@/types/interfaces'
import { Avatar, IconButton, Stack, Typography } from '@mui/material'

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
      <Typography
        variant="bodySm"
        lineHeight="32px"
        fontWeight={500}
        fontSize="12px"
        sx={{ color: (theme) => theme.color.gray[600] }}
      >
        Filter by
      </Typography>
      {assigneeValue?.name || assigneeValue?.givenName ? (
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar
            alt={assigneeValue?.givenName == 'No assignee' ? '' : assigneeValue?.givenName}
            src={
              ((assigneeValue as IAssigneeCombined).avatarImageUrl || (assigneeValue as IAssigneeCombined).iconImageUrl) ??
              'user'
            }
            sx={{ width: '20px', height: '20px' }}
            variant={assigneeValue?.type === 'companies' ? 'rounded' : 'circular'}
          />
          <Typography
            variant="bodySm"
            lineHeight="32px"
            fontWeight={500}
            fontSize="12px"
            sx={{ color: (theme) => theme.color.gray[600] }}
          >
            {assigneeValue?.name || assigneeValue?.givenName}
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
        <Typography
          variant="bodySm"
          lineHeight="32px"
          fontWeight={500}
          fontSize="12px"
          sx={{ color: (theme) => theme.color.gray[600] }}
        >
          assignee
        </Typography>
      )}
    </Stack>
  )
}
