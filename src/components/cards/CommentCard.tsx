'use client'

import { Avatar, Box, InputAdornment, Stack, styled, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { z } from 'zod'

import { updateComment } from '@/app/detail/[task_id]/[user_type]/actions'
import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import { BoldTypography, CommentCardContainer, StyledModal, StyledTypography } from '@/app/detail/ui/styledComponent'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ListBtn } from '@/components/buttons/ListBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { EditCommentButtons } from '@/components/buttonsGroup/EditCommentButtons'
import { MenuBox } from '@/components/inputs/MenuBox'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { PencilIcon, TrashIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { setOpenImage } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { getAssigneeName } from '@/utils/assignee'
import { getMentionsList } from '@/utils/getMentionList'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { commentAddedResponseSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'

const CustomDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  width: 'calc(100% + 20px)',
  backgroundColor: theme.color.borders.border,
  marginLeft: '-10px',
  marginRight: '-10px',
}))

export const CommentCard = ({
  comment,
  createComment,
  deleteComment,
  task_id,
}: {
  comment: LogResponse
  createComment: (postCommentPayload: CreateComment) => void
  deleteComment: (id: string) => void
  task_id: string
}) => {
  const [showReply, setShowReply] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [detail, setDetail] = useState('')
  const [timeAgo, setTimeAgo] = useState(getTimeDifference(comment.createdAt))
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true)
  const editRef = useRef<HTMLDivElement>(null)

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const canEdit = tokenPayload?.internalUserId == comment?.initiator?.id
  const { assignee, activeTask, token } = useSelector(selectTaskBoard)

  const [isFocused, setIsFocused] = useState(false)

  const windowWidth = useWindowWidth()
  const isMobile = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || windowWidth < 600
  }
  const handleImagePreview = (e: React.MouseEvent<unknown>) => {
    store.dispatch(setOpenImage((e.target as HTMLImageElement).src))
  }

  const content = (comment.details as { content: string }).content || ''
  const [editedContent, setEditedContent] = useState(content)
  const [isListOrMenuActive, setIsListOrMenuActive] = useState(false)

  const handleReplySubmission = () => {
    const replyPayload: CreateComment = {
      content: detail,
      taskId: task_id,
      parentId: commentAddedResponseSchema.parse(comment.details).id,
      mentions: getMentionsList(detail),
    }
    if (detail) {
      createComment(replyPayload)
      setDetail('')
    }
  }

  useEffect(() => {
    const updateTimeAgo = () => setTimeAgo(getTimeDifference(comment.createdAt))
    const intervalId = setInterval(updateTimeAgo, 60 * 1000)
    return () => clearInterval(intervalId)
  }, [comment.createdAt])
  const commentUser = assignee.find((el) => el.id === comment?.initiator?.id)
  const uploadFn = token
    ? async (file: File) => {
        if (activeTask) {
          const fileUrl = await uploadImageHandler(file, token ?? '', activeTask.workspaceId, task_id)
          return fileUrl
        }
      }
    : undefined

  const cancelEdit = () => {
    setIsReadOnly(true)
    setEditedContent(content)
  }
  const handleEdit = async () => {
    if (isTapwriteContentEmpty(editedContent)) {
      setEditedContent(content)
      setIsReadOnly(true)
      return
    }
    const commentId = z.string().parse(comment.details.id)
    const updateCommentPayload: UpdateComment = {
      content: editedContent,
      // mentions : add mentions in the future
    }
    token && (await updateComment(token, commentId, updateCommentPayload))
    setIsReadOnly(true)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused || isMobile()) {
        return
      }
      if (event.key === 'Enter' && !event.shiftKey && !isListOrMenuActive) {
        event.preventDefault()
        handleEdit()
      }
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        handleEdit() //Invoke submit if ctrl+enter is pressed at any time
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editedContent, isListOrMenuActive, isFocused, isMobile])

  return (
    <CommentCardContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        backgroundColor: (theme) => (isReadOnly ? `${theme.color.gray[100]}` : `${theme.color.base.white}`),
        overflow: 'hidden',
      }}
    >
      <Stack direction="column" rowGap={'2px'}>
        {isReadOnly && (
          <Stack direction="row" justifyContent={'space-between'} alignItems="center">
            <Stack direction="row" columnGap={1} alignItems="center">
              {commentUser ? (
                <BoldTypography>{getAssigneeName(commentUser, '')}</BoldTypography>
              ) : (
                <Typography variant="md" sx={{ fontStyle: 'italic' }}>
                  Deleted User
                </Typography>
              )}
              <DotSeparator />
              <StyledTypography sx={{ lineHeight: '22px' }}>
                {timeAgo} {comment.details.updatedAt !== comment.details.createdAt ? '(edited)' : ''}
              </StyledTypography>
            </Stack>

            {(isHovered || isMobile()) && canEdit && (
              <Stack direction="row" columnGap={2} sx={{ height: '10px' }} alignItems="center">
                <MenuBox
                  menuContent={
                    <>
                      <ListBtn
                        content="Edit comment"
                        handleClick={() => {
                          setIsReadOnly(false)
                          if (editRef.current) {
                            editRef.current.focus()
                          }
                        }}
                        icon={<PencilIcon />}
                        contentColor={(theme) => theme.color.text.text}
                        width="175px"
                        height="33px"
                      />

                      <ListBtn
                        content="Delete comment"
                        handleClick={() => {
                          setShowConfirmDeleteModal(true)
                        }}
                        icon={<TrashIcon />}
                        contentColor={(theme) => theme.color.error}
                        width="175px"
                        height="33px"
                      />
                    </>
                  }
                  isSecondary
                  width={'22px'}
                  height={'22px'}
                  displayButtonBackground={false}
                  noHover={false}
                />
              </Stack>
            )}
          </Stack>
        )}
        <Box onBlur={() => setIsFocused(false)} onFocus={() => setIsFocused(true)}>
          <Tapwrite
            content={editedContent}
            onActiveStatusChange={(prop) => {
              const { isListActive, isFloatingMenuActive } = prop
              setIsListOrMenuActive(isListActive || isFloatingMenuActive)
            }}
            getContent={setEditedContent}
            readonly={isReadOnly}
            editorRef={editRef}
            editorClass={'tapwrite-comment'}
            addAttachmentButton={true}
            uploadFn={uploadFn}
            deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', task_id, null)}
            maxUploadLimit={MAX_UPLOAD_LIMIT}
            attachmentLayout={(props) => <AttachmentLayout {...props} isComment={true} />}
            hardbreak
            parentContainerStyle={{
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
            endButtons={<EditCommentButtons cancelEdit={cancelEdit} handleEdit={handleEdit} isReadOnly={isReadOnly} />}
            handleImageDoubleClick={handleImagePreview}
          />
        </Box>

        {Array.isArray((comment as LogResponse).details?.replies) &&
          ((comment as LogResponse).details.replies as LogResponse[]).map((item: LogResponse) => {
            return (
              <Stack direction="column" rowGap={3} key={item.id}>
                <CustomDivider />
                <Stack direction="row" columnGap={2} alignItems={'center'}>
                  <Avatar
                    alt={item?.initiator?.givenName}
                    src={item?.initiator?.avatarImageUrl || 'user'}
                    sx={{ width: '20px', height: '20px', fontSize: '14px' }}
                  />
                  <BoldTypography>
                    {item.initiator?.givenName} {item.initiator?.familyName}
                  </BoldTypography>
                  <StyledTypography> {getTimeDifference(item.createdAt)}</StyledTypography>
                </Stack>
                <Tapwrite
                  content={item.details?.content as string}
                  getContent={() => {}}
                  readonly
                  editorClass="tapwrite-comment"
                  attachmentLayout={AttachmentLayout}
                  parentContainerStyle={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '566px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                />
              </Stack>
            )
          })}

        {(Array.isArray((comment as LogResponse).details?.replies) &&
          ((comment as LogResponse).details.replies as LogResponse[]).length > 0) ||
        showReply ? (
          <>
            <CustomDivider />
            <Stack direction="row" columnGap={1} alignItems="flex-start">
              <Avatar alt="user" src={''} sx={{ width: '20px', height: '20px', marginTop: '5px' }} />
              <Tapwrite
                content={detail}
                getContent={setDetail}
                placeholder="Leave a reply..."
                // suggestions={assigneeSuggestions}
                editorClass="tapwrite-reply-input"
                attachmentLayout={AttachmentLayout}
                parentContainerStyle={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '566px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
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
                <PrimaryBtn buttonText="Reply" handleClick={handleReplySubmission} />
              </InputAdornment>
            </Stack>
          </>
        ) : null}
      </Stack>
      <StyledModal
        open={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        aria-labelledby="delete-task-modal"
        aria-describedby="delete-task"
      >
        <ConfirmDeleteUI
          handleCancel={() => setShowConfirmDeleteModal(false)}
          handleDelete={() => {
            deleteComment((comment as LogResponse).details.id as string)
            setShowConfirmDeleteModal(false)
          }}
          bodyTag="comment"
        />
      </StyledModal>
    </CommentCardContainer>
  )
}
