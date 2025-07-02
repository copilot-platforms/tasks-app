import { CrossIcon } from '@/icons'
import store from '@/redux/store'
import { FilterOptions, IAssigneeCombined } from '@/types/interfaces'
import { Avatar, IconButton, Stack, Typography } from '@mui/material'
import { CopilotAvatar } from '../atoms/CopilotAvatar'
import { getAssigneeName } from '@/utils/assignee'

export const FilterByAssigneeBtn = ({ assigneeValue }: { assigneeValue: IAssigneeCombined | null }) => {
  return (
    <Stack direction="row" alignItems="center" columnGap={1}>
      <Typography
        variant="sm"
        lineHeight="32px"
        sx={{ color: (theme) => theme.color.gray[600], whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
      >
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
              maxWidth: '100px',
            }}
            title={getAssigneeName(assigneeValue)}
          >
            {getAssigneeName(assigneeValue)}
          </Typography>
        </Stack>
      ) : (
        <Typography
          variant="sm"
          lineHeight="32px"
          sx={{
            color: (theme) => theme.color.gray[600],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          assignee
        </Typography>
      )}
    </Stack>
  )
}
