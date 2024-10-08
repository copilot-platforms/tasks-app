'use client'

import { BoldTypography, StyledTypography, TypographyContainer } from '@/app/detail/ui/styledComponent'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { ActivityLog as ActivityLogType } from '@/types/activityLogs'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Avatar, Box, Stack } from '@mui/material'
import { ActivityType } from '@prisma/client'
import { useSelector } from 'react-redux'

interface ActivityLogProps {
  log: ActivityLogType
}

export const ActivityLog = ({ log }: ActivityLogProps) => {
  const { assignee: assignees } = useSelector(selectTaskBoard)

  const user = assignees.find((assignee) => assignee.id === log.userId)
  if (!user) {
    return <></>
  }

  const activityDescription: { [key in ActivityType]: React.ReactNode } = {
    [ActivityType.TASK_CREATED]: <StyledTypography> created task</StyledTypography>,

    // TODO: Implement these when prioritized in a milestone
    [ActivityType.TASK_ASSIGNED]: (
      <>
        <StyledTypography> assigned task to </StyledTypography>
        {/* <BoldTypography>{to}.</BoldTypography> */}
      </>
    ),
    [ActivityType.WORKFLOW_STATE_UPDATED]: (
      <>
        <StyledTypography> changed status from </StyledTypography>
        {/* <BoldTypography>{from}</BoldTypography> */}
        <StyledTypography> to </StyledTypography>
        {/* <BoldTypography>{to}.</BoldTypography> */}
      </>
    ),
    [ActivityType.COMMENT_ADDED]: <></>,
  }

  return (
    <Stack className="activity-log" direction="row" columnGap={'16px'} position="relative">
      {/* <VerticalLine /> */}
      <Avatar src={user.avatarImageUrl || 'user'} alt={user.givenName} sx={{ width: '25px', height: '25px' }} />
      <TypographyContainer direction="row" columnGap={1}>
        <BoldTypography>
          {user.givenName} {user.familyName}
        </BoldTypography>
        {activityDescription[log.type]}
        <Box display={'flex'} alignItems={'center'}>
          {/* Make sure that if this takes a new line, the dot is in the front, as shown in design */}
          <svg xmlns="http://www.w3.org/2000/svg" width="3" height="4" viewBox="0 0 3 4" fill="none">
            <circle cx="1.5" cy="2.08301" r="1.5" fill="#C9CBCD" />
          </svg>{' '}
          &nbsp;
          <StyledTypography> {getTimeDifference(log.createdAt.toString())}</StyledTypography>
        </Box>
      </TypographyContainer>
    </Stack>
  )
}
