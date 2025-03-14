import { commentAddedResponseSchema } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { CustomDivider } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import AttachmentLayout from '@/components/AttachmentLayout'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SubmitCommentButtons } from '@/components/buttonsGroup/SubmitCommentButtons'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { CreateComment } from '@/types/dto/comment.dto'
import { getMentionsList } from '@/utils/getMentionList'
import { deleteEditorAttachmentsHandler } from '@/utils/inlineImage'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { Avatar, Box, InputAdornment, Stack } from '@mui/material'
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'

interface ReplyInputProps {
  task_id: string
  comment: any
  createComment: (postCommentPayload: CreateComment) => void
  uploadFn: ((file: File) => Promise<string | undefined>) | undefined
  focusReplyInput: boolean
  setFocusReplyInput: Dispatch<SetStateAction<boolean>>
}

export const ReplyInput = ({
  task_id,
  comment,
  createComment,
  uploadFn,
  focusReplyInput,
  setFocusReplyInput,
}: ReplyInputProps) => {
  const [detail, setDetail] = useState('')
  const { token, assignee } = useSelector(selectTaskBoard)
  const windowWidth = useWindowWidth()
  const isMobile = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || windowWidth < 600
  }
  const [isUploading, setIsUploading] = useState(false)
  const [isListOrMenuActive, setIsListOrMenuActive] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const currentUserId = tokenPayload?.internalUserId ?? tokenPayload?.clientId
  const currentUserDetails = assignee.find((el) => el.id === currentUserId)
  const [pendingReplies, setPendingReplies] = useState<{ content: string; taskId: string }[]>([])

  const handleReplySubmission = useCallback(() => {
    let content = detail
    const END_P = '<p></p>'
    if (content.slice(-7) === END_P) {
      content = content.slice(0, -7)
    }

    if (!isTapwriteContentEmpty(detail)) {
      setDetail('')
      setPendingReplies((prev) => [...prev, { content, taskId: task_id }])
    }
  }, [comment, detail, task_id])

  useEffect(() => {
    if (pendingReplies.length > 0 && !comment.details.id.includes('temp-comment')) {
      const { content, taskId } = pendingReplies[0]
      createComment({
        content,
        taskId,
        parentId: comment.details.id,
      })
      setPendingReplies((prev) => prev.slice(1)) //handling the reply submission 1 by 1
    }
  }, [comment.details.id, pendingReplies])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!focusReplyInput || isMobile()) {
        return
      }
      if (event.key === 'Enter' && !event.shiftKey && !isListOrMenuActive) {
        event.preventDefault()
        handleReplySubmission()
      }
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        handleReplySubmission()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [detail, isListOrMenuActive, focusReplyInput, isMobile])

  const handleUploadStatusChange = (uploading: boolean) => {
    setIsUploading(uploading)
  }

  const editorRef = useRef<HTMLDivElement | null>(null)
  const [isMultiline, setIsMultiline] = useState(false)

  useEffect(() => {
    if (editorRef.current) {
      const height = editorRef.current.getBoundingClientRect().height
      if (height > 40) setIsMultiline(true)
    }
  }, [detail, editorRef.current])

  useEffect(() => {
    if (editorRef.current && focusReplyInput) {
      editorRef.current.focus()
    }
  }, [focusReplyInput, editorRef.current])

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
        <CopilotAvatar
          width="20px"
          height="20px"
          fontSize="10px"
          currentAssignee={currentUserDetails}
          sx={{
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
          }}
        />
        <Box onBlur={() => setFocusReplyInput(false)} onFocus={() => setFocusReplyInput(true)} width={'100%'}>
          <Tapwrite
            editorRef={editorRef}
            content={detail}
            getContent={setDetail}
            placeholder="Leave a reply..."
            editorClass="tapwrite-reply-input"
            className={'tapwrite-reply-input'}
            hardbreak
            onActiveStatusChange={(prop) => {
              const { isListActive, isFloatingMenuActive } = prop
              setIsListOrMenuActive(isListActive || isFloatingMenuActive)
            }}
            attachmentLayout={(props) => (
              <AttachmentLayout {...props} isComment={true} onUploadStatusChange={handleUploadStatusChange} />
            )}
            parentContainerStyle={{
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: isMultiline ? 'column' : 'row',
              overflow: 'hidden',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              justifyContent: 'center',
              alignItems: isMultiline ? 'flex-start' : 'center',
              marginTop: isMultiline ? '0px' : '-5px',
              flexGrow: 1,
            }}
            addAttachmentButton
            deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', task_id, null)}
            uploadFn={uploadFn}
            maxUploadLimit={MAX_UPLOAD_LIMIT}
            endButtons={<SubmitCommentButtons handleSubmit={handleReplySubmission} disabled={isUploading} />}
          />
        </Box>
      </Stack>
    </>
  )
}
