import { ActivityType } from '@/types/interfaces'
import { Avatar, Box, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, VerticalLine } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { mockActivitiesInterface } from '@/utils/mockData'

interface Prop {
  log: mockActivitiesInterface
}

export const ActivityLog = ({ log }: Prop) => {
  const logEntities =
    log.activityType == ActivityType.WORKFLOWSTATE_UPDATE
      ? [log.details?.prevWorkflowState?.type, log.details?.currentWorkflowState?.type]
      : log.activityType == ActivityType.ASSIGN_TASK
        ? [log.details?.assignedTo]
        : []

  const activityDescription: { [key in ActivityType]: (...args: string[]) => React.ReactNode } = {
    [ActivityType.CREATE_TASK]: () => <StyledTypography> created task. </StyledTypography>,
    [ActivityType.ASSIGN_TASK]: (to: string) => (
      <>
        <StyledTypography> assigned task to </StyledTypography>
        <BoldTypography>{to}.</BoldTypography>
      </>
    ),
    [ActivityType.WORKFLOWSTATE_UPDATE]: (from: string, to: string) => (
      <>
        <StyledTypography> changed status from </StyledTypography>
        <BoldTypography>{from}</BoldTypography>
        <StyledTypography> to </StyledTypography>
        <BoldTypography>{to}.</BoldTypography>
      </>
    ),
  }
  return (
    <Stack direction="row" columnGap={4} position="relative">
      <VerticalLine />
      <Avatar alt="user" src={log?.iconImageUrl || log?.avatarImageUrl} sx={{ width: '25px', height: '25px' }} />
      <Stack direction="row" columnGap={1}>
        <BoldTypography>{log.details.initiator}</BoldTypography>
        {activityDescription[log.activityType](...logEntities)}
      </Stack>
      <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
    </Stack>
  )
}
