import {
  ArchivedStateUpdatedSchema,
  DueDateChangedSchema,
  LogResponse,
  TaskAssignedResponse,
  TaskAssignedResponseSchema,
  TitleUpdatedSchema,
  WorkflowStateUpdatedSchema,
} from '@/app/api/activity-logs/schemas'
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
        const taskAssignees = TaskAssignedResponseSchema.parse(log.details)
        return getAssignedToName(taskAssignees)

      case ActivityType.TITLE_UPDATED:
        const titles = TitleUpdatedSchema.parse(log.details)
        return [titles.oldValue, titles.newValue]

      case ActivityType.ARCHIVE_STATE_UPDATED:
        const archivedStates = ArchivedStateUpdatedSchema.parse(log.details)
        return [archivedStates.newValue ? 'archived' : 'unarchived']

      case ActivityType.DUE_DATE_CHANGED:
        const dueDates = DueDateChangedSchema.parse(log.details)
        return [dueDates.oldValue ?? '', dueDates.newValue ?? '']

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
    [ActivityType.TITLE_UPDATED]: (_from: string, to: string) => (
      <>
        <StyledTypography> changed title to </StyledTypography>
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
        {to ? <BoldTypography> {DueDateFormatter(to)}</BoldTypography> : <StyledTypography> none</StyledTypography>}
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
