import { Avatar, Stack } from '@mui/material'
import { VerticalLine } from './styledComponent'
import { CommentCard } from '@/components/cards/CommentCard'
import { CreateComment } from '@/types/dto/comment.dto'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { IAssigneeCombined } from '@/types/interfaces'

interface Prop {
  comment: LogResponse
  createComment: (postCommentPayload: CreateComment) => void
  deleteComment: (id: string) => void
  task_id: string
}

export const Comments = ({ comment, createComment, deleteComment, task_id }: Prop) => {
  return (
    <Stack
      id={String(comment.details.id)}
      direction="row"
      columnGap={2}
      position="relative"
      sx={{ padding: '11px 0px 11px 0px' }}
    >
      <VerticalLine />
      <CopilotAvatar
        width="24px"
        height="24px"
        fontSize="13px"
        currentAssignee={comment.initiator as unknown as IAssigneeCombined}
        sx={{
          border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          marginTop: '5px',
        }}
      />

      <CommentCard comment={comment} createComment={createComment} deleteComment={deleteComment} task_id={task_id} />
    </Stack>
  )
}
