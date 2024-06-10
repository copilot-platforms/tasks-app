'use client'

import {
  BoldTypography,
  CommentCardContainer,
  StyledReplyIcon,
  StyledTypography,
  TapWriteComment,
  TapWriteReplyInput,
} from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Avatar, Box, InputAdornment, Stack, styled } from '@mui/material'
import { TrashIcon } from '@/icons'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { useState } from 'react'
import { ListBtn } from '@/components/buttons/ListBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { useSelector } from 'react-redux'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import AvatarWithInitials from '@/components/Avatar/AvatarWithInitials'

const CustomDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  width: 'calc(100% + 20px)',
  backgroundColor: theme.color.borders.border,
  marginLeft: '-10px',
  marginRight: '-10px',
}))

export const CommentCard = ({ comment }: { comment: any }) => {
  const [showReply, setShowReply] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [detail, setDetail] = useState('')
  const { tokenPayload } = useSelector(selectAuthDetails)
  const canEdit = tokenPayload?.internalUserId == comment.details.initiatorId
  return (
    <CommentCardContainer onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Stack direction="column" rowGap={3}>
        <Stack direction="row" justifyContent={'space-between'} alignItems="center">
          <Stack direction="row" columnGap={3}>
            <BoldTypography>{comment.details.initiator}</BoldTypography>
            <StyledTypography> {getTimeDifference(comment.createdAt)}</StyledTypography>
          </Stack>

          {isHovered && (
            <Stack direction="row" columnGap={2} sx={{ height: '10px' }}>
              <StyledReplyIcon
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.stopPropagation()

                  setShowReply(!showReply)
                }}
              />
              {canEdit && (
                <MenuBox
                  menuContent={
                    <ListBtn content="Delete" handleClick={() => {}} icon={<TrashIcon />} contentColor="#CC0000" />
                  }
                  isSecondary
                />
              )}
            </Stack>
          )}
        </Stack>

        <TapWriteComment content={comment.content} getContent={() => {}} readonly />

        {comment.children?.map((item: any) => {
          return (
            <Stack direction="column" rowGap={3} key={item.id}>
              <CustomDivider />
              <Stack direction="row" columnGap={2} alignItems={'center'}>
                <AvatarWithInitials
                  alt="user"
                  altName={comment.details.initiator}
                  src={comment?.iconImageUrl || comment?.avatarImageUrl}
                  sx={{ width: '20px', height: '20px' }}
                />
                <BoldTypography>{item.details?.initiator}</BoldTypography>
                <StyledTypography> {getTimeDifference(item.createdAt)}</StyledTypography>
              </Stack>
              <TapWriteComment content={item.content} getContent={() => {}} readonly />
            </Stack>
          )
        })}

        {comment.children.length > 0 || showReply ? (
          <>
            <CustomDivider />
            <Stack direction="row" columnGap={1} alignItems="flex-start">
              <Avatar alt="user" src={''} sx={{ width: '20px', height: '20px', marginTop: '5px' }} />
              <TapWriteReplyInput content={''} getContent={(content) => setDetail(content)} placeholder="Leave a reply..." />
              <InputAdornment
                position="end"
                sx={{
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'flex-end',
                  paddingBottom: '10px',
                }}
              >
                <PrimaryBtn buttonText="Reply" handleClick={() => {}} />
              </InputAdornment>
            </Stack>
          </>
        ) : null}
      </Stack>
    </CommentCardContainer>
  )
}
