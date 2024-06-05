import { ToggleController } from '@/app/detail/ui/ToggleController'
import { BoldTypography, StyledEmojiIcon, StyledReplyIcon, StyledTypography } from '@/app/detail/ui/styledComponent'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Avatar, Box, Divider, InputAdornment, Stack, Typography, styled } from '@mui/material'
import { StyledTextField } from '../inputs/TextField'
import { AttachmentIcon, EmojiIcon, ReplyIcon, TrashIcon } from '@/icons'
import { PrimaryBtn } from '../buttons/PrimaryBtn'
import { useState } from 'react'
import { ListBtn } from '../buttons/ListBtn'
import { MenuBox } from '../inputs/MenuBox'

const CommentCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '10px',
  width: '100%',
  backgroundColor: `${theme.color.gray[100]}`,
}))

const CustomDivider = styled(Box)(({ theme }) => ({
  height: '1px',
  width: 'calc(100% + 20px)',
  backgroundColor: theme.color.borders.border,
  marginLeft: '-10px',
  marginRight: '-10px',
}))

export const CommentCard = ({ comment }: { comment: any }) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showReply, setShowReply] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
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
              <StyledEmojiIcon />
              <StyledReplyIcon
                onClick={(event: React.MouseEvent<HTMLElement>) => {
                  event.stopPropagation()
                  setIsFocused(!showReply)
                  setShowReply(!showReply)
                }}
              />
              <MenuBox
                menuContent={<ListBtn content="Delete" handleClick={() => {}} icon={<TrashIcon />} contentColor="#CC0000" />}
                isSecondary
              />
            </Stack>
          )}
        </Stack>

        <Typography> {comment.content}</Typography>

        {comment.children?.map((item: any) => {
          return (
            <Stack direction="column" rowGap={3} key={item.id}>
              <CustomDivider />
              <Stack direction="row" columnGap={2} alignItems={'center'}>
                <Avatar
                  alt="user"
                  src={comment?.iconImageUrl || comment?.avatarImageUrl}
                  sx={{ width: '20px', height: '20px' }}
                />
                <BoldTypography>{item.details?.initiator}</BoldTypography>
                <StyledTypography> {getTimeDifference(item.createdAt)}</StyledTypography>
              </Stack>
              <Typography> {item.content}</Typography>
            </Stack>
          )
        })}

        {comment.children.length > 0 || showReply ? (
          <>
            <CustomDivider />
            <Stack direction="row" columnGap={1} alignItems="flex-start">
              <Avatar alt="user" src={''} sx={{ width: '20px', height: '20px', marginTop: '5px' }} />
              <StyledTextField
                type="text"
                multiline
                borderLess
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': {
                    fontSize: '16px',
                    lineHeight: '28px',
                    color: (theme) => theme.color.gray[600],
                    fontWeight: 400,
                  },
                }}
                rows={isFocused ? 2 : 1}
                placeholder={'Leave a reply...'}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                  endAdornment: isFocused && (
                    <InputAdornment
                      position="end"
                      sx={{
                        alignSelf: 'flex-end',
                        display: 'flex',
                        alignItems: 'flex-end',
                      }}
                    >
                      <Stack direction="row" columnGap={6}>
                        <input id="fileInput" type="file" style={{ display: 'none' }} onChange={() => {}} />
                        <label htmlFor="fileInput">
                          <AttachmentIcon />
                        </label>
                        <PrimaryBtn buttonText="Reply" handleClick={() => {}} />
                      </Stack>
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </>
        ) : null}
      </Stack>
    </CommentCardContainer>
  )
}
