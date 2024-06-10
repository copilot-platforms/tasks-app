import { Avatar, Box, Stack } from '@mui/material'
import { BoldTypography, StyledTypography, VerticalLine } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { mockActivitiesInterface } from '@/utils/mockData'
import {
  ActivityLogResponse,
  Activity_AssignTaskSchema,
  Activity_WorkflowState_UpdateSchema,
} from '@/types/dto/activity.dto'

interface Prop {
  log: ActivityLogResponse
}

enum LogType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  WORKFLOW_STATE_UPDATED = 'WORKFLOW_STATE_UPDATED',
}

export const ActivityLog = ({ log }: Prop) => {
  const logEntities =
    log.type == LogType.WORKFLOW_STATE_UPDATED
      ? [
          Activity_WorkflowState_UpdateSchema.parse(log.details)?.prevWorkflowState?.type,
          Activity_WorkflowState_UpdateSchema.parse(log.details)?.currentWorkflowState?.type,
        ]
      : log.type == LogType.TASK_ASSIGNED
        ? [Activity_AssignTaskSchema.parse(log.details)?.assignedTo]
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
    // [ActivityType.COMMENT_ADDED]: () => <> </>,
  }

  return (
    <Stack direction="row" columnGap={4} position="relative">
      <VerticalLine />
      <Avatar alt="user" src={log.details.initiator} sx={{ width: '25px', height: '25px' }} />
      <Stack direction="row" columnGap={1}>
        <BoldTypography>{log.details.initiator}</BoldTypography>
        {activityDescription[log.type as LogType](...logEntities)}
      </Stack>
      <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
    </Stack>
  )
}
