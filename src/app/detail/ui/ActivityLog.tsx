import ActivityDescription from '@/components/activity/ActivityDescription'
import { ActivityType } from '@/types/interfaces'

import { Avatar, Box, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, VerticalLine, WrapperStack } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'

interface Prop {
  log: any
  isLast: boolean
}

export const ActivityLog = ({ log, isLast }: Prop) => {
  const renderArgs =
    log.activityType == ActivityType.WORKFLOWSTATE_UPDATE
      ? [log.details?.prevWorkflowState?.type, log.details?.currentWorkflowState?.type]
      : log.activityType == ActivityType.ASSIGN_TASK
        ? [log.details?.assignedTo]
        : []

  return (
    <WrapperStack>
      <Stack direction="row" columnGap={4}>
        {!isLast && <VerticalLine />}

        <Avatar alt="user" src={log?.iconImageUrl || log?.avatarImageUrl} sx={{ width: '25px', height: '25px' }} />
        <Stack direction="row" columnGap={1}>
          <BoldTypography>{log.details.initiator}</BoldTypography>
          <ActivityDescription activityType={log.activityType} args={renderArgs} />
        </Stack>
        <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
      </Stack>
    </WrapperStack>
  )
}
