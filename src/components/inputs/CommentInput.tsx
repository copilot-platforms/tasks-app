'use client'

import { CommentCardContainer } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import AttachmentLayout from '@/components/AttachmentLayout'
import { SubmitCommentButtons } from '@/components/buttonsGroup/SubmitCommentButtons'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { CreateComment } from '@/types/dto/comment.dto'
import { getMentionsList } from '@/utils/getMentionList'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { ArrowUpward } from '@mui/icons-material'
import { Box, IconButton, InputAdornment, Stack } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'

interface Prop {
  createComment: (postCommentPayload: CreateComment) => void
  task_id: string
}

export const CommentInput = ({ createComment, task_id }: Prop) => {
  const [detail, setDetail] = useState('')
  const [isListOrMenuActive, setIsListOrMenuActive] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const { assignee, token, activeTask } = useSelector(selectTaskBoard)
  const currentUserId = tokenPayload?.internalUserId ?? tokenPayload?.clientId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)
  const [isUploading, setIsUploading] = useState(false)

  const [isFocused, setIsFocused] = useState(false)
  const windowWidth = useWindowWidth()
  const isMobile = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || windowWidth < 600
  }

  const handleSubmit = () => {
    let content = detail
    const END_P = '<p></p>'
    const endChunk = content.slice(-7)
    if (endChunk === END_P) {
      content = content.slice(0, -7)
    }
    // Check if `detail` is effectively empty
    if (!isTapwriteContentEmpty(detail)) {
      const commentPayload: CreateComment = {
        content,
        taskId: task_id,
        mentions: getMentionsList(detail),
      }
      createComment(commentPayload)
      setDetail('') // Clear the input after creating comment
    }
  }
  // useEffect to handle keydown event for Enter key

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused || isMobile()) {
        return
      }
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
  }, [detail, isListOrMenuActive, isFocused, isMobile]) // Depend on detail to ensure the latest state is captured

  const uploadFn = token
    ? async (file: File) => {
        if (activeTask) {
          const fileUrl = await uploadImageHandler(file, token ?? '', activeTask.workspaceId, task_id)
          return fileUrl
        }
      }
    : undefined
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragEnter = () => {
    dragCounter.current += 1
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    dragCounter.current -= 1
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    dragCounter.current = 0
  }

  const handleUploadStatusChange = (uploading: boolean) => {
    setIsUploading(uploading)
  }
  return (
    <Stack direction="row" columnGap={2} alignItems="flex-start">
      <CopilotAvatar
        width="22px"
        height="22px"
        fontSize="12px"
        currentAssignee={currentUserDetails}
        sx={{
          border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          marginTop: '5px',
        }}
      />
      <CommentCardContainer
        sx={{
          backgroundColor: (theme) => (isDragging ? theme.color.background.bgCommentDrag : theme.color.base.white),
          wordBreak: 'break-word',
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      >
        <Tapwrite
          content={detail}
          getContent={setDetail}
          placeholder="Leave a comment..."
          // suggestions={assigneeSuggestions} enable this for mentions
          editorClass="tapwrite-comment-input"
          hardbreak
          onActiveStatusChange={(prop) => {
            const { isListActive, isFloatingMenuActive } = prop
            setIsListOrMenuActive(isListActive || isFloatingMenuActive)
          }}
          parentContainerStyle={{
            width: '100%',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
          uploadFn={uploadFn}
          deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', task_id, null)}
          attachmentLayout={(props) => (
            <AttachmentLayout {...props} isComment={true} onUploadStatusChange={handleUploadStatusChange} />
          )}
          addAttachmentButton
          maxUploadLimit={MAX_UPLOAD_LIMIT}
          endButtons={<SubmitCommentButtons handleSubmit={handleSubmit} disabled={isUploading} />}
        />
      </CommentCardContainer>
    </Stack>
  )
}
