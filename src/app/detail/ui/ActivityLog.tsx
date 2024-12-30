import { ArchivedStateUpdatedSchema } from '@/app/api/activity-logs/schemas/ArchiveStateUpdatedSchema'
import { DueDateChangedSchema } from '@/app/api/activity-logs/schemas/DueDateChangedSchema'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { TaskAssignedResponse, TaskAssignedResponseSchema } from '@/app/api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@/app/api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import { BoldTypography, StyledTypography, TypographyContainer, VerticalLine } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { DueDateFormatter } from '@/utils/dueDateFormatter'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Stack, Typography } from '@mui/material'
import { ActivityType } from '@prisma/client'
import { useSelector } from 'react-redux'

interface Prop {
  log: LogResponse
}

export const ActivityLog = ({ log }: Prop) => {
  const { assignee, workflowStates } = useSelector(selectTaskBoard)

  const getAssignedToName = (details: TaskAssignedResponse) => {
    const assignedTo = assignee.find((el) => el.id === details.newValue)
    const assignedFrom = assignee.find((el) => el.id === details.oldValue)
    return [getAssigneeName(assignedFrom, ''), getAssigneeName(assignedTo, 'Deleted User')]
  }

  const getLogEntities = (type: ActivityType) => {
    switch (type) {
      case ActivityType.WORKFLOW_STATE_UPDATED:
        const { oldValue, newValue } = WorkflowStateUpdatedSchema.parse(log.details)
        const getWorkflowStateName = (id: string) => workflowStates.find((state) => state.id === id)?.name || 'Deleted'
        return [getWorkflowStateName(oldValue), getWorkflowStateName(newValue)]

      case ActivityType.TASK_ASSIGNED:
        return getAssignedToName(TaskAssignedResponseSchema.parse(log.details))

      case ActivityType.ARCHIVE_STATE_UPDATED:
        return [ArchivedStateUpdatedSchema.parse(log.details)?.newValue ? 'archived' : 'unarchived']

      case ActivityType.DUE_DATE_CHANGED:
        return [
          DueDateChangedSchema.parse(log.details)?.oldValue ?? '',
          DueDateChangedSchema.parse(log.details)?.newValue ?? '',
        ]

      default:
        return []
    }
  }

  const logEntities = getLogEntities(log.type)

  const activityDescription: { [key in ActivityType]: (...args: string[]) => React.ReactNode } = {
    [ActivityType.TASK_CREATED]: () => (
      <>
        <StyledTypography> created task</StyledTypography>
        <DotSeparator />
      </>
    ),
    [ActivityType.TASK_ASSIGNED]: (from: string, to: string) => (
      <>
        <StyledTypography> {from && `re-`}assigned task </StyledTypography>
        <StyledTypography> to </StyledTypography>
        <BoldTypography>{to}</BoldTypography>
        <DotSeparator />
      </>
    ),
    [ActivityType.WORKFLOW_STATE_UPDATED]: (from: string, to: string) => (
      <>
        <StyledTypography> changed status from </StyledTypography>
        <BoldTypography>{from}</BoldTypography>
        <StyledTypography> to </StyledTypography>
        <BoldTypography>{to}</BoldTypography>
        <DotSeparator />
      </>
    ),
    [ActivityType.DUE_DATE_CHANGED]: (from: string, to: string) => (
      <>
        <StyledTypography> changed due date </StyledTypography>
        {from && (
          <>
            <StyledTypography> from </StyledTypography> <BoldTypography> {DueDateFormatter(from)}</BoldTypography>
          </>
        )}
        <StyledTypography> to</StyledTypography>
        <BoldTypography> {DueDateFormatter(to)}</BoldTypography>
        <DotSeparator />
      </>
    ),
    [ActivityType.ARCHIVE_STATE_UPDATED]: (archivedStatus: string) => (
      <>
        <StyledTypography> {archivedStatus} task</StyledTypography>
        <DotSeparator />
      </>
    ),
    [ActivityType.COMMENT_ADDED]: () => null,
  }

  const activityUser = assignee.find((el) => el.id === log?.initiator?.id)

  return (
    <Stack direction="row" columnGap={4} position="relative">
      <VerticalLine />
      <CopilotAvatar
        width="24px"
        height="24px"
        fontSize="13px"
        currentAssignee={log?.initiator as unknown as IAssigneeCombined}
        sx={{
          border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
        }}
      />
      <TypographyContainer direction="row" columnGap={1}>
        {activityUser ? (
          <BoldTypography>{getAssigneeName(activityUser, '')}</BoldTypography>
        ) : (
          <Typography variant="md" sx={{ fontStyle: 'italic' }}>
            Deleted User
          </Typography>
        )}
        {activityDescription[log.type as ActivityType](...logEntities)}
        <StyledTypography> {getTimeDifference(log.createdAt)}</StyledTypography>
      </TypographyContainer>
    </Stack>
  )
}
