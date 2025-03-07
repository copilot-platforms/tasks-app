'use client'

import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { z } from 'zod'

import { updateComment } from '@/app/detail/[task_id]/[user_type]/actions'
import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import {
  BoldTypography,
  CommentCardContainer,
  CustomDivider,
  StyledModal,
  StyledTypography,
} from '@/app/detail/ui/styledComponent'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ListBtn } from '@/components/buttons/ListBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { EditCommentButtons } from '@/components/buttonsGroup/EditCommentButtons'
import { MenuBox } from '@/components/inputs/MenuBox'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { PencilIcon, ReplyIcon, TrashIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { setExpandedComments, setOpenImage } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { CommentResponse, CreateComment, UpdateComment } from '@/types/dto/comment.dto'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { IAssigneeCombined } from '@/types/interfaces'
import { getAssigneeName } from '@/utils/assignee'
import { getMentionsList } from '@/utils/getMentionList'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { ReplyResponse } from '@api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'
import { ReplyCard } from '@/components/cards/ReplyCard'
import { ReplyInput } from '@/components/inputs/ReplyInput'
import useSWR from 'swr'
import { fetcher } from '@/utils/fetcher'
import { CollapsibleReplyCard } from '@/components/cards/CollapsibleReplyCard'

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

  const [replies, setReplies] = useState(comment.details.replies as ReplyResponse[])

  const [timeAgo, setTimeAgo] = useState(getTimeDifference(comment.createdAt))
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true)
  const editRef = useRef<HTMLDivElement>(null)

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const canEdit = tokenPayload?.internalUserId == comment?.initiator?.id || tokenPayload?.clientId == comment?.initiator?.id
  const canDelete = tokenPayload?.internalUserId == comment?.initiator?.id
  const { assignee, activeTask, token } = useSelector(selectTaskBoard)
  const { expandedComments } = useSelector(selectTaskDetails)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  useEffect(() => {
    const updateTimeAgo = () => setTimeAgo(getTimeDifference(comment.createdAt))
    const intervalId = setInterval(updateTimeAgo, 60 * 1000)
    return () => clearInterval(intervalId)
  }, [comment.createdAt])

  const uploadFn = token
    ? async (file: File) => {
        if (activeTask) {
          const fileUrl = await uploadImageHandler(file, token, activeTask.workspaceId, task_id)
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

  const commentUser = comment.initiator as unknown as IAssigneeCombined
  const replyCount = (comment.details as CommentResponse).replyCount

  const cacheKey = `/api/comment/?token=${token}&parentId=${comment.details.id}`
  const { data: comments, mutate } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    refreshWhenOffline: false,
    refreshWhenHidden: false,
    refreshInterval: 0,
  })
  const fetchCommentsWithFullReplies = async () => {
    try {
      const updatedComment = await mutate()

      setReplies(updatedComment?.comments || comment.details.replies || [])
      store.dispatch(setExpandedComments([...expandedComments, z.string().parse(comment.details.id)]))
    } catch (error) {
      console.error('Failed to fetch replies:', error)
    }
  }

  useEffect(() => {
    if (expandedComments.includes(z.string().parse(comment.details.id))) {
      fetchCommentsWithFullReplies()
    } else {
      setReplies((comment.details.replies as ReplyResponse[]) || [])
    }
  }, [comment])

  return (
    <CommentCardContainer
      sx={{
        backgroundColor: (theme) => (isReadOnly ? `${theme.color.gray[100]}` : `${theme.color.base.white}`),
        overflow: 'hidden',
      }}
    >
      <Stack direction="column" rowGap={'4px'}>
        <Stack
          direction="column"
          rowGap={'2px'}
          sx={{ paddingBottom: '4px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
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

              {(isHovered || isMobile() || isMenuOpen) && canEdit && (
                <Stack direction="row" columnGap={2} sx={{ height: '10px' }} alignItems="center">
                  <ReplyButton handleClick={() => setShowReply((prev) => !prev)} />
                  <MenuBox
                    getMenuOpen={(open) => {
                      setIsMenuOpen(open)
                    }}
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
                        {canDelete && (
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
                        )}
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
              addAttachmentButton={!isReadOnly}
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
        </Stack>

        {((Array.isArray((comment as LogResponse).details?.replies) &&
          ((comment as LogResponse).details.replies as ReplyResponse[]).length > 0) ||
          showReply) && <CustomDivider />}

        {replyCount > 3 && !expandedComments.includes(z.string().parse(comment.details.id)) && (
          <CollapsibleReplyCard
            lastAssignees={comment.details.firstInitiators as IAssigneeCombined[]}
            fetchCommentsWithFullReplies={fetchCommentsWithFullReplies}
            replyCount={replyCount}
          />
        )}

        {Array.isArray((comment as LogResponse).details?.replies) &&
          replies.map((item: ReplyResponse) => {
            return (
              <ReplyCard
                item={item}
                key={item.id}
                uploadFn={uploadFn}
                task_id={task_id}
                handleImagePreview={handleImagePreview}
              />
            )
          })}

        {(Array.isArray((comment as LogResponse).details?.replies) &&
          ((comment as LogResponse).details.replies as LogResponse[]).length > 0) ||
        showReply ? (
          <ReplyInput comment={comment} task_id={task_id} createComment={createComment} uploadFn={uploadFn} />
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

const ReplyButton = ({ handleClick }: { handleClick: () => void }) => {
  return (
    <Box
      sx={{
        padding: '3px',
        borderRadius: '4px',
        alignItems: 'center',
        display: 'flex',
        ':hover': {
          backgroundColor: (theme) => theme.color.gray[150],
        },
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <ReplyIcon />
    </Box>
  )
}
