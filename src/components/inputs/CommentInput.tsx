'use client'

import { Avatar, Box, InputAdornment, Stack } from '@mui/material'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AttachmentIcon } from '@/icons'
import { Tapwrite } from 'tapwrite'
import { useState } from 'react'
import { CommentCardContainer, TapWriteCommentInput } from '@/app/detail/ui/styledComponent'

export const CommentInput = () => {
  const [detail, setDetail] = useState('')
  return (
    <Stack direction="row" columnGap={3} alignItems="flex-start">
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px' }} />
      <CommentCardContainer>
        <TapWriteCommentInput content={''} getContent={(content) => setDetail(content)} />
        <InputAdornment
          position="end"
          sx={{
            alignSelf: 'flex-end',
            display: 'flex',
            alignItems: 'flex-end',
            paddingBottom: '10px',
          }}
        >
          <PrimaryBtn buttonText="Comment" handleClick={() => {}} />
        </InputAdornment>
      </CommentCardContainer>
    </Stack>
  )
}
