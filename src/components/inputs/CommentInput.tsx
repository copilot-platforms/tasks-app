'use client'

import { Avatar, Box, InputAdornment, Stack } from '@mui/material'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AttachmentIcon } from '@/icons'
import { Tapwrite } from 'tapwrite'
import { useState } from 'react'
import { CommentCardContainer, TapWriteCommentInput } from '@/app/detail/ui/styledComponent'
import { CreateComment } from '@/types/dto/comment.dto'
import { useSelector } from 'react-redux'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getMentionsList } from '@/utils/getMentionList'

interface Prop {
  createComment: (postCommentPayload: CreateComment) => void
  task_id: string
}
export const CommentInput = ({ createComment, task_id }: Prop) => {
  const [detail, setDetail] = useState('')
  const { assigneeSuggestions } = useSelector(selectTaskDetails)

  const handleSubmit = () => {
    const commentPaylod: CreateComment = {
      content: detail,
      taskId: task_id,
      mentions: getMentionsList(detail),
    }
    if (detail) {
      createComment(commentPaylod)
      setDetail('')
    }
  }
  return (
    <Stack direction="row" columnGap={3} alignItems="flex-start">
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px' }} />
      <CommentCardContainer>
        <TapWriteCommentInput
          content={detail}
          getContent={setDetail}
          placeholder="Leave a comment..."
          suggestions={assigneeSuggestions}
        />
        <InputAdornment
          position="end"
          sx={{
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: '10px',
          }}
        >
          <PrimaryBtn buttonText="Comment" handleClick={handleSubmit} disabled={!detail} />
        </InputAdornment>
      </CommentCardContainer>
    </Stack>
  )
}
