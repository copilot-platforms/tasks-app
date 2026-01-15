import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import { CommentCard } from '@/components/cards/CommentCard'
import { CreateComment } from '@/types/dto/comment.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'
import { Stack } from '@mui/material'
import { VerticalLine } from './styledComponent'
import { OptimisticUpdate } from '@/utils/optimisticCommentUtils'
import { TrashIcon2 } from '@/icons'
import { useSelector } from 'react-redux'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'

interface Prop {
  comment: LogResponse
  createComment: (postCommentPayload: CreateComment) => void
  deleteComment: (id: string, replyId?: string, softDelete?: boolean) => void
  task_id: string
  stableId: string
  optimisticUpdates: OptimisticUpdate[]
  postAttachment: (postAttachmentPayload: CreateAttachmentRequest) => void
}

export const Comments = ({
  comment,
  createComment,
  deleteComment,
  task_id,
  stableId,
  optimisticUpdates,
  postAttachment,
}: Prop) => {
  const { assignee } = useSelector(selectTaskBoard)
  const commentInitiator = assignee.find((assignee) => assignee.id == comment.userId)
  return (
    <Stack id={stableId} direction="row" columnGap={2} position="relative">
      <VerticalLine />
      <Stack direction="row" columnGap={2} padding={'0px 0px 12px 0px'} width={'100%'}>
        <CopilotAvatar
          width="22px"
          height="22px"
          fontSize="12px"
          currentAssignee={commentInitiator}
          sx={{
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
            marginTop: '8px',
          }}
          size="large"
          icon={comment.details.deletedAt ? <TrashIcon2 /> : undefined}
        />

        <CommentCard
          data-comment-card="true"
          comment={comment}
          createComment={createComment}
          deleteComment={deleteComment}
          task_id={task_id}
          optimisticUpdates={optimisticUpdates}
          commentInitiator={commentInitiator}
          postAttachment={postAttachment}
        />
      </Stack>
    </Stack>
  )
}
