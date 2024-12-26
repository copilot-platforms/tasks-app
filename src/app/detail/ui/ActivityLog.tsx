import { Avatar, Box, Stack, Typography } from '@mui/material'
import { BoldTypography, StyledTypography, TypographyContainer, VerticalLine } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { TaskAssignedResponse, TaskAssignedResponseSchema } from '@/app/api/activity-logs/schemas/TaskAssignedSchema'
import { WorkflowStateUpdatedSchema } from '@/app/api/activity-logs/schemas/WorkflowStateUpdatedSchema'
import { ActivityType } from '@prisma/client'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'

interface Prop {
  log: LogResponse
}

export const ActivityLog = ({ log }: Prop) => {
  const { assignee } = useSelector(selectTaskBoard)
  const getAssignedToName = (details: TaskAssignedResponse) => {
    const assignedTo = assignee.find((el) => el.id === details.assigneeId)
    return getAssigneeName(assignedTo, 'Deleted User')
  }

  const logEntities =
    log.type == ActivityType.WORKFLOW_STATE_UPDATED
      ? [
          // WorkflowStateUpdatedSchema.parse(log.details)?.oldWorkflowState?.name,
          // WorkflowStateUpdatedSchema.parse(log.details)?.newWorkflowState?.name,
        ]
      : log.type == ActivityType.TASK_ASSIGNED
        ? [getAssignedToName(TaskAssignedResponseSchema.parse(log.details))]
        : []

  const activityDescription: { [key in ActivityType]: (...args: string[]) => React.ReactNode } = {
    [ActivityType.TASK_CREATED]: () => (
      <StyledTypography>
        {' '}
        created task <span>&#x2022;</span>{' '}
      </StyledTypography>
    ),
    [ActivityType.TASK_ASSIGNED]: (to: string) => (
      <>
        <StyledTypography> assigned task to </StyledTypography>
        <BoldTypography>{to}</BoldTypography>
        <StyledTypography>
          {' '}
          <span>&#x2022;</span>{' '}
        </StyledTypography>
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
        {assignee.find((el) => el.id === log?.initiator?.id) ? (
          <BoldTypography>
            {log.initiator.givenName} {log.initiator.familyName}
          </BoldTypography>
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
