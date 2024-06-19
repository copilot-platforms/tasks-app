import { Avatar, Box, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, TypographyContainer, VerticalLine } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { TaskAssignedResponse, TaskAssignedResponseSchema } from '@/app/api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@/app/api/activity-logs/schemas/WorkflowStateUpdatedSchema'

interface Prop {
  log: LogResponse
}

enum LogType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  WORKFLOW_STATE_UPDATED = 'WORKFLOW_STATE_UPDATED',
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
    log.type == LogType.WORKFLOW_STATE_UPDATED
      ? [
          WorkflowStateUpdatedSchema.parse(log.details)?.oldWorkflowState?.name,
          WorkflowStateUpdatedSchema.parse(log.details)?.newWorkflowState?.name,
        ]
      : log.type == LogType.TASK_ASSIGNED
        ? [getAssignedToName(TaskAssignedResponseSchema.parse(log.details))]
        : []

  const activityDescription: { [key in LogType]: (...args: string[]) => React.ReactNode } = {
    [LogType.TASK_CREATED]: () => <StyledTypography> created task. </StyledTypography>,
    [LogType.TASK_ASSIGNED]: (to: string) => (
      <>
        <StyledTypography> assigned task to </StyledTypography>
        <BoldTypography>{to}.</BoldTypography>
      </>
    ),
    [LogType.WORKFLOW_STATE_UPDATED]: (from: string, to: string) => (
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
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px' }} />
      <TypographyContainer direction="row" columnGap={1}>
        <BoldTypography>
          {log.initiator.givenName} {log.initiator.familyName}
        </BoldTypography>
        {activityDescription[log.type as LogType](...logEntities)}
        <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
      </TypographyContainer>
    </Stack>
  )
}
