'use client'

import { Avatar, Box, IconButton, InputAdornment, Stack } from '@mui/material'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'

import { useState } from 'react'
import { CommentCardContainer } from '@/app/detail/ui/styledComponent'
import { CreateComment } from '@/types/dto/comment.dto'
import { useSelector } from 'react-redux'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getMentionsList } from '@/utils/getMentionList'
import { Tapwrite } from 'tapwrite'
import { ArrowUpIcon } from '@/icons'
import { ArrowUpward } from '@mui/icons-material'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'

interface Prop {
  createComment: (postCommentPayload: CreateComment) => void
  task_id: string
}
export const CommentInput = ({ createComment, task_id }: Prop) => {
  const [detail, setDetail] = useState('')
  const { assigneeSuggestions } = useSelector(selectTaskDetails)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { assignee } = useSelector(selectTaskBoard)
  const currentUserId = tokenPayload?.clientId ?? tokenPayload?.internalUserId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)

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
    <Stack direction="row" columnGap={2} alignItems="flex-start">
      <Avatar
        alt="user"
        src={currentUserDetails?.avatarImageUrl}
        sx={{
          width: '25px',
          height: '25px',
          border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          borderRadius: '9999px',
          marginTop: '5px',
        }}
      />
      <CommentCardContainer
        sx={{
          backgroundColor: (theme) => `${theme.color.base.white}`,
          wordBreak: 'break-all',
        }}
      >
        <Tapwrite
          content={detail}
          getContent={setDetail}
          placeholder="Leave a comment..."
          suggestions={assigneeSuggestions}
          editorClass="tapwrite-comment-input"
        />
        <InputAdornment
          position="end"
          sx={{
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <IconButton
            onClick={() => handleSubmit()}
            sx={{ backgroundColor: '#000', borderRadius: '4px', padding: '5px', '&:hover': { bgcolor: '#000' } }}
          >
            <ArrowUpward sx={{ color: '#ffffff', fontSize: '18px' }} />
          </IconButton>
        </InputAdornment>
      </CommentCardContainer>
    </Stack>
  )
}
