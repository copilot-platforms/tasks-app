import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import { CustomDivider } from '@/app/detail/ui/styledComponent'
import { OverlappingAvatars } from '@/components/atoms/OverlappingAvatars'
import { IAssigneeCombined } from '@/types/interfaces'
import { Box, Stack, Typography } from '@mui/material'

interface CollapsibleReplyCardProps {
  replyCount: number
  fetchCommentsWithFullReplies: () => void
  lastAssignees: (IAssigneeCombined | undefined)[]
}

export const CollapsibleReplyCard = ({
  lastAssignees,
  fetchCommentsWithFullReplies,
  replyCount,
}: CollapsibleReplyCardProps) => {
  return (
    <>
      <Stack
        sx={{
          padding: '8px',
          alignSelf: 'stretch',
          alignItems: 'center',
          display: 'flex',
        }}
        direction="row"
        columnGap={'8px'}
      >
        <OverlappingAvatars assignees={lastAssignees} />

        <Stack direction={'row'} columnGap={'4px'} sx={{ marginTop: '0px' }}>
          <Typography variant="md" lineHeight="22px">
            {replyCount - 3} previous {replyCount - 3 === 1 ? 'reply' : 'replies'}
          </Typography>
          <DotSeparator />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={fetchCommentsWithFullReplies}
          >
            <Typography
              sx={{
                ':hover': {
                  color: (theme) => theme.color.text.textPrimary,
                },
                color: (theme) => theme.color.text.textSecondary,
              }}
              lineHeight="22px"
              variant="md"
            >
              View all
            </Typography>
          </Box>
        </Stack>
      </Stack>
      <CustomDivider />
    </>
  )
}
