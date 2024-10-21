'use client'

import { BoldTypography, CommentCardContainer, StyledReplyIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Avatar, Box, InputAdornment, Modal, Stack, styled, Typography } from '@mui/material'
import { TrashIcon } from '@/icons'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { useState } from 'react'
import { ListBtn } from '@/components/buttons/ListBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { useSelector } from 'react-redux'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'

import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { commentAddedResponseSchema } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { CreateComment } from '@/types/dto/comment.dto'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { getMentionsList } from '@/utils/getMentionList'
import { selectTaskDetails } from '@/redux/features/taskDetailsSlice'
import { Tapwrite } from 'tapwrite'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { TempCommentType } from '@/app/detail/ui/ActivityWrapper'

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
  comment: LogResponse | TempCommentType
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
      <Stack direction="column" rowGap={'3px'}>
        <Stack direction="row" justifyContent={'space-between'} alignItems="center">
          <Stack direction="row" columnGap={3}>
            {assignee.find((el) => el.id === comment.initiator.id) ? (
              <BoldTypography>
                {comment.initiator.givenName} {comment.initiator.familyName}
              </BoldTypography>
            ) : (
              <Typography variant="md" sx={{ fontStyle: 'italic' }}>
                Deleted User
              </Typography>
            )}
            <StyledTypography> {getTimeDifference(comment.createdAt)}</StyledTypography>
          </Stack>

          {isHovered && (
            <Stack direction="row" columnGap={2} sx={{ height: '10px' }}>
              {/* <StyledReplyIcon */}
              {/*   onClick={(event: React.MouseEvent<HTMLElement>) => { */}
              {/*     event.stopPropagation() */}

              {/*     setShowReply(!showReply) */}
              {/*   }} */}
              {/* /> */}
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
          content={comment.details.content as string}
          getContent={() => {}}
          readonly
          editorClass="tapwrite-comment"
        />

        {(comment as any).details?.replies?.map((item: any) => {
          return (
            <Stack direction="column" rowGap={3} key={item.id}>
              <CustomDivider />
              <Stack direction="row" columnGap={2} alignItems={'center'}>
                <Avatar
                  alt={comment?.initiator?.givenName}
                  src={comment?.initiator?.avatarImageUrl || 'user'}
                  sx={{ width: '20px', height: '20px' }}
                />
                <BoldTypography>
                  {' '}
                  {item.initiator?.givenName} {item.initiator?.familyName}
                </BoldTypography>
                <StyledTypography> {getTimeDifference(item.createdAt)}</StyledTypography>
              </Stack>
              <Tapwrite content={item.content} getContent={() => {}} readonly editorClass="tapwrite-comment" />
            </Stack>
          )
        })}

        {(comment as any).details.replies?.length > 0 || showReply ? (
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
            console.log('comment id for delete', (comment as LogResponse).details.id)
            deleteComment((comment as LogResponse).details.id as string)
            setShowConfirmDeleteModal(false)
          }}
          body="comment"
        />
      </Modal>
    </CommentCardContainer>
  )
}
