'use client'

import { Avatar, Box, InputAdornment, Stack } from '@mui/material'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AttachmentIcon } from '@/icons'
import { Tapwrite } from 'tapwrite'
import { useState } from 'react'
import { CommentCardContainer, TapWriteCommentInput } from '@/app/detail/ui/styledComponent'
import { CreateComment } from '@/types/dto/comment.dto'

interface Prop {
  createComment: (postCommentPayload: CreateComment) => void
  task_id: string
}
export const CommentInput = ({ createComment, task_id }: Prop) => {
  const [detail, setDetail] = useState('')
  const handleSubmit = () => {
    const commentPaylod: CreateComment = {
      content: detail,
      taskId: task_id,
    }
    if (detail) {
      createComment(commentPaylod)
    }
  }
  return (
    <Stack direction="row" columnGap={3} alignItems="flex-start">
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px' }} />
      <CommentCardContainer>
        <TapWriteCommentInput content={detail} getContent={setDetail} placeholder="Leave a comment..." />
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
