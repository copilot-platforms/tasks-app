'use client'

import { Avatar, Box, IconButton, InputAdornment, Stack } from '@mui/material'
import { useState, useEffect } from 'react'
import { CommentCardContainer } from '@/app/detail/ui/styledComponent'
import { CreateComment } from '@/types/dto/comment.dto'
import { useSelector } from 'react-redux'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { getMentionsList } from '@/utils/getMentionList'
import { Tapwrite } from 'tapwrite'
import { ArrowUpward } from '@mui/icons-material'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'

interface Prop {
  createComment: (postCommentPayload: CreateComment) => void
  task_id: string
}

export const CommentInput = ({ createComment, task_id }: Prop) => {
  const [detail, setDetail] = useState('')
  const [isListOrMenuActive, setIsListOrMenuActive] = useState(false)
  const { assigneeSuggestions } = useSelector(selectTaskDetails)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { assignee } = useSelector(selectTaskBoard)
  const currentUserId = tokenPayload?.clientId ?? tokenPayload?.internalUserId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)

  const isContentEmpty = (content: string) => {
    // Regular expression to match only empty paragraphs, whitespace, or <br> tags
    const emptyContentRegex = /^(<p>(\s|(<br\s*\/?>))*<\/p>)*$/
    return emptyContentRegex.test(content)
  }

  const handleSubmit = () => {
    let content = detail
    const END_P = '<p></p>'
    const endChunk = content.slice(-7)
    if (endChunk === END_P) {
      content = content.slice(0, -7)
    }
    // Check if `detail` is effectively empty
    if (!isContentEmpty(detail)) {
      const commentPayload: CreateComment = {
        content,
        taskId: task_id,
        mentions: getMentionsList(detail),
      }
      createComment(commentPayload)
      setDetail('') // Clear the input after creating comment
    } else {
      console.log('Comment cannot be empty.')
    }
  }
  // useEffect to handle keydown event for Enter key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey && !isListOrMenuActive) {
        event.preventDefault() // Prevent new line in the editor
        handleSubmit()
      }
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        handleSubmit() //Invoke submit if ctrl+enter is pressed at any time
      }
      // If Shift + Enter is pressed, do not prevent default,
      // allowing Tapwrite to handle the new line.
    }

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [detail, isListOrMenuActive]) // Depend on detail to ensure the latest state is captured

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
          fontSize: '13px',
        }}
      />
      <CommentCardContainer
        sx={{
          backgroundColor: (theme) => `${theme.color.base.white}`,
          wordBreak: 'break-word',
        }}
      >
        <Tapwrite
          content={detail}
          getContent={setDetail}
          placeholder="Leave a comment..."
          suggestions={assigneeSuggestions}
          editorClass="tapwrite-comment-input"
          hardbreak
          onActiveStatusChange={(prop) => {
            const { isListActive, isFloatingMenuActive } = prop
            setIsListOrMenuActive(isListActive || isFloatingMenuActive)
          }}
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
            onClick={() => handleSubmit()} // Call handleSubmit on button click
            sx={{
              backgroundColor: '#000',
              borderRadius: '4px',
              padding: '5px',
              '&:hover': { bgcolor: '#000' },
            }}
          >
            <ArrowUpward sx={{ color: '#ffffff', fontSize: '18px' }} />
          </IconButton>
        </InputAdornment>
      </CommentCardContainer>
    </Stack>
  )
}
