import { commentAddedResponseSchema } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { CustomDivider } from '@/app/detail/ui/styledComponent'
import AttachmentLayout from '@/components/AttachmentLayout'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SubmitCommentButtons } from '@/components/buttonsGroup/SubmitCommentButtons'
import { CreateComment } from '@/types/dto/comment.dto'
import { getMentionsList } from '@/utils/getMentionList'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { Avatar, InputAdornment, Stack } from '@mui/material'
import { useState } from 'react'
import { Tapwrite } from 'tapwrite'

interface ReplyInputProps {
  task_id: string
  comment: any
  createComment: (postCommentPayload: CreateComment) => void
  uploadFn: ((file: File) => Promise<string | undefined>) | undefined
}

export const ReplyInput = ({ task_id, comment, createComment, uploadFn }: ReplyInputProps) => {
  const [detail, setDetail] = useState('')
  const handleReplySubmission = () => {
    let content = detail
    const END_P = '<p></p>'
    const endChunk = content.slice(-7)
    if (endChunk === END_P) {
      content = content.slice(0, -7)
    }
    if (!isTapwriteContentEmpty(detail)) {
      const replyPayload: CreateComment = {
        content,
        taskId: task_id,
        parentId: commentAddedResponseSchema.parse(comment.details).id,
        // mentions: getMentionsList(detail),
      }
      createComment(replyPayload)
      setDetail('')
    }
  }

  return (
    <>
      <Stack
        direction="row"
        columnGap={'8px'}
        width="100%"
        sx={{
          padding: '8px 0px 0px 0px',
        }}
      >
        <Avatar alt="user" src={''} sx={{ width: '20px', height: '20px', marginTop: '5px' }} />

        <Tapwrite
          content={detail}
          getContent={setDetail}
          placeholder="Leave a reply..."
          // suggestions={assigneeSuggestions}
          hardbreak
          editorClass="tapwrite-reply-input"
          attachmentLayout={(props) => <AttachmentLayout {...props} isComment={true} />}
          parentContainerStyle={{
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
            paddingTop: '4px',
          }}
          addAttachmentButton
          uploadFn={uploadFn}
          endButtons={<SubmitCommentButtons handleSubmit={handleReplySubmission} />}
        />
      </Stack>
    </>
  )
}
