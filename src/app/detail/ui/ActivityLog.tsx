'use client'

import { Avatar, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, TypographyContainer, VerticalLine } from '@/app/detail/ui/styledComponent'
import { ActivityType, ActivityLog as PrismaActivityLog } from '@prisma/client'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IAssigneeCombined } from '@/types/interfaces'
import { getTimeDifference } from '@/utils/getTimeDifference'

interface ActivityLogProps {
  log: PrismaActivityLog
}

export const ActivityLog = ({ log }: Omit<ActivityLogProps, 'deletedAt'>) => {
  const { assignee: assignees } = useSelector(selectTaskBoard)
  const deletedUserDetails: Omit<IAssigneeCombined, 'id' | 'type'> = {
    givenName: 'Deleted User',
  }

  const user = assignees.find((assignee) => assignee.id === log.userId) || deletedUserDetails
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
    <Stack direction="row" columnGap={4} position="relative">
      <VerticalLine />
      <Avatar src={user.avatarImageUrl || 'user'} alt={user.givenName} sx={{ width: '25px', height: '25px' }} />
      <TypographyContainer direction="row" columnGap={1}>
        <BoldTypography>
          {user.givenName} {user.familyName}
        </BoldTypography>
        {activityDescription[log.type]}
        <StyledTypography> {getTimeDifference(log.createdAt.toString())}</StyledTypography>
      </TypographyContainer>
    </Stack>
  )
}
