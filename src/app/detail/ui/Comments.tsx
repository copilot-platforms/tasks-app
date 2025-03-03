import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { CommentCard } from '@/components/cards/CommentCard'
import { CreateComment } from '@/types/dto/comment.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'
import { Stack } from '@mui/material'
import { VerticalLine } from './styledComponent'

interface Prop {
  comment: LogResponse
  createComment: (postCommentPayload: CreateComment) => void
  deleteComment: (id: string) => void
  task_id: string
  stableId: string
}

export const Comments = ({ comment, createComment, deleteComment, task_id, stableId }: Prop) => {
  return (
    <Stack id={stableId} direction="row" columnGap={2} position="relative">
      <VerticalLine />
      <Stack direction="row" columnGap={2} padding={'0px 0px 12px 0px'} width={'100%'}>
        <CopilotAvatar
          width="24px"
          height="24px"
          fontSize="13px"
          currentAssignee={comment.initiator as unknown as IAssigneeCombined}
          sx={{
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
            marginTop: '5px',
          }}
          size="large"
        />

        <CommentCard comment={comment} createComment={createComment} deleteComment={deleteComment} task_id={task_id} />
      </Stack>
    </Stack>
  )
}
