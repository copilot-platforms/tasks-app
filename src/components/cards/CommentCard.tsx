'use client'

import { commentAddedResponseSchema } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { BoldTypography, CommentCardContainer, StyledTypography } from '@/app/detail/ui/styledComponent'
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
import { getMentionsList } from '@/utils/getMentionList'
import { getTimeDifference } from '@/utils/getTimeDifference'

import { Avatar, Box, InputAdornment, Modal, Stack, styled, Typography } from '@mui/material'
import { useState } from 'react'
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
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const canEdit = tokenPayload?.internalUserId == comment.initiator.id
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
          <Stack direction="row" columnGap={3} alignItems="center">
            {assignee.find((el) => el.id === comment.initiator.id) ? (
              <BoldTypography>
                {comment.initiator.givenName} {comment.initiator.familyName}
              </BoldTypography>
            ) : (
              <Typography variant="md" sx={{ fontStyle: 'italic' }}>
                Deleted User
              </Typography>
            )}
            <BoldTypography>
              <span>&#x2022;</span>
            </BoldTypography>
            <StyledTypography sx={{ lineHeight: '22px' }}> {getTimeDifference(comment.createdAt)}</StyledTypography>
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
      <Modal
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
          body="comment"
        />
      </Modal>
    </CommentCardContainer>
  )
}
