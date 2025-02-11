'use client'

import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import { BoldTypography, CommentCardContainer, StyledModal, StyledTypography } from '@/app/detail/ui/styledComponent'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ListBtn } from '@/components/buttons/ListBtn'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { TrashIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { CreateComment } from '@/types/dto/comment.dto'
import { getAssigneeName } from '@/utils/assignee'
import { getMentionsList } from '@/utils/getMentionList'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { commentAddedResponseSchema } from '@api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@api/activity-logs/schemas/LogResponseSchema'
import { Avatar, Box, InputAdornment, Stack, styled, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'

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

  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const canEdit = tokenPayload?.internalUserId == comment?.initiator?.id
  const { assigneeSuggestions } = useSelector(selectTaskDetails)
  const { assignee } = useSelector(selectTaskBoard)

  const windowWidth = useWindowWidth()
  const isMobile = windowWidth < 600 && windowWidth !== 0

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

  return (
    <CommentCardContainer
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        backgroundColor: (theme) => `${theme.color.gray[100]}`,
      }}
    >
      <Stack direction="column" rowGap={'2px'}>
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
            <StyledTypography sx={{ lineHeight: '22px' }}> {timeAgo}</StyledTypography>
          </Stack>

          {(isHovered || isMobile) && (
            <Stack direction="row" columnGap={2} sx={{ height: '10px' }} alignItems="center">
              {canEdit && (
                <MenuBox
                  menuContent={
                    <ListBtn
                      content="Delete"
                      handleClick={() => {
                        setShowConfirmDeleteModal(true)
                      }}
                      icon={<TrashIcon />}
                      contentColor={(theme) => theme.color.error}
                    />
                  }
                  isSecondary
                  width={'22px'}
                  height={'22px'}
                  displayButtonBackground={false}
                  noHover={false}
                />
              )}
            </Stack>
          )}
        </Stack>

        <Tapwrite
          content={(comment.details as { content: string }).content}
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
                suggestions={assigneeSuggestions}
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
