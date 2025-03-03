'use client'

import { ReplyResponse } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { BoldTypography, CustomDivider, StyledTypography } from '@/app/detail/ui/styledComponent'
import AttachmentLayout from '@/components/AttachmentLayout'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { Avatar, Stack } from '@mui/material'
import { Tapwrite } from 'tapwrite'

export const ReplyCard = ({ item }: { item: ReplyResponse }) => {
  return (
    <>
      <Stack
        direction="row"
        columnGap={2}
        alignItems="flex-start"
        sx={{
          padding: '8px 0px 0px 0px',
        }}
      >
        <Avatar
          alt={item?.initiator?.givenName}
          src={item?.initiator?.avatarImageUrl || 'user'}
          sx={{ width: '20px', height: '20px', fontSize: '14px' }}
        />
        <Stack
          direction="column"
          rowGap={'2px'}
          width={'100%'}
          sx={{
            paddingBottom: '8px',
            borderBottom: (theme) => `1px solid ${theme.color.borders.border}`,
            marginRight: '-10px',
            paddingRight: '10px',
          }}
        >
          <Stack direction="row" columnGap={2} alignItems={'center'}>
            <BoldTypography>
              {item.initiator?.givenName} {item.initiator?.familyName}
            </BoldTypography>
            <StyledTypography> {getTimeDifference(item.createdAt)}</StyledTypography>
          </Stack>
          <Tapwrite
            content={item?.content as string}
            getContent={() => {}}
            readonly
            hardbreak
            editorClass="tapwrite-comment"
            attachmentLayout={(props) => <AttachmentLayout {...props} isComment={true} />}
            parentContainerStyle={{
              width: '100%',
              maxWidth: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          />
        </Stack>
      </Stack>
    </>
  )
}
