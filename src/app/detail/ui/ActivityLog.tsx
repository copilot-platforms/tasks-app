import { Avatar, Box, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, TypographyContainer, VerticalLine } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import AvatarWithInitials from '@/components/Avatar/AvatarWithInitials'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { TaskAssignedResponse, TaskAssignedResponseSchema } from '@/app/api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@/app/api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { ActivityType } from '@prisma/client'

interface Prop {
  log: LogResponse
}

const getAssignedToName = (details: TaskAssignedResponse) => {
  if (details.newAssigneeDetails.givenName || details.newAssigneeDetails.familyName) {
    return `${details.newAssigneeDetails.givenName} ${details.newAssigneeDetails.familyName}`
  } else {
    return `${details.newAssigneeDetails.name}`
  }
}

export const ActivityLog = ({ log }: Prop) => {
  const logEntities =
    log.type == ActivityType.WORKFLOW_STATE_UPDATED
      ? [
          WorkflowStateUpdatedSchema.parse(log.details)?.oldWorkflowState?.name,
          WorkflowStateUpdatedSchema.parse(log.details)?.newWorkflowState?.name,
        ]
      : log.type == ActivityType.TASK_ASSIGNED
        ? [getAssignedToName(TaskAssignedResponseSchema.parse(log.details))]
        : []

  const activityDescription: { [key in ActivityType]: (...args: string[]) => React.ReactNode } = {
    [ActivityType.TASK_CREATED]: () => <StyledTypography> created task. </StyledTypography>,
    [ActivityType.TASK_ASSIGNED]: (to: string) => (
      <>
        <StyledTypography> assigned task to </StyledTypography>
        <BoldTypography>{to}.</BoldTypography>
      </>
    ),
    [ActivityType.WORKFLOW_STATE_UPDATED]: (from: string, to: string) => (
      <>
        <StyledTypography> changed status from </StyledTypography>
        <BoldTypography>{from}</BoldTypography>
        <StyledTypography> to </StyledTypography>
        <BoldTypography>{to}.</BoldTypography>
      </>
    ),
    [ActivityType.COMMENT_ADDED]: () => null,
  }
  return (
    <Stack direction="row" columnGap={4} position="relative">
      <VerticalLine />
      <AvatarWithInitials
        alt="user"
        src={log?.initiator?.avatarImageUrl || ''}
        altName={log?.initiator?.givenName}
        sx={{ width: '25px', height: '25px' }}
      />
      <TypographyContainer direction="row" columnGap={1}>
        <BoldTypography>
          {log.initiator.givenName} {log.initiator.familyName}
        </BoldTypography>
        {activityDescription[log.type as ActivityType](...logEntities)}
        <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
      </TypographyContainer>
    </Stack>
  )
}
