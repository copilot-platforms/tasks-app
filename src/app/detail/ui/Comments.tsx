import { Stack } from '@mui/material'
import { VerticalLine } from './styledComponent'
import { CommentCard } from '@/components/cards/CommentCard'
import AvatarWithInitials from '@/components/Avatar/AvatarWithInitials'
import { CreateComment } from '@/types/dto/comment.dto'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'

interface Prop {
  comment: LogResponse
  createComment: (postCommentPayload: CreateComment) => void
  deleteComment: (id: string) => void
  task_id: string
}

export const Comments = ({ comment, createComment, deleteComment, task_id }: Prop) => {
  return (
    <Stack direction="row" columnGap={2} position="relative">
      <VerticalLine />
      <AvatarWithInitials
        altName={comment?.initiator?.givenName}
        alt="user"
        src={''}
        sx={{ width: '25px', height: '25px', marginTop: '5px' }}
      />
      <CommentCard comment={comment} createComment={createComment} deleteComment={deleteComment} task_id={task_id} />
    </Stack>
  )
}
