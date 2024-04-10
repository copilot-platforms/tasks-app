'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { AttachmentIcon } from '@/icons'
import { statusIcons } from '@/utils/iconMatcher'
import { Box, Stack } from '@mui/material'
import { useState } from 'react'

type Attachment = {
  name: string
  fileSize: string
  fileType: string
}

interface Prop {
  title: string
  detail: string
  attachment: Attachment[]
}

export const TaskEditor = ({ title, detail, attachment }: Prop) => {
  const [updateTitle, setUpdateTitle] = useState(title)
  const [updateDetail, setUpdateDetail] = useState(detail)
  return (
    <>
      <Stack direction="row" alignItems="center" columnGap={2}>
        <Box pt="5px">{statusIcons['Todo']}</Box>
        <StyledTextField
          type="text"
          multiline
          borderLess
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              fontSize: '20px',
              lineHeight: '28px',
              color: (theme) => theme.color.gray[600],
              fontWeight: 500,
            },
          }}
          value={updateTitle}
          onChange={(e) => setUpdateTitle(e.target.value)}
        />
      </Stack>
      <Box>
        <StyledTextField
          type="text"
          placeholder="Add description..."
          multiline
          borderLess
          minRows={8}
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              fontSize: '16px',
              lineHeight: '24px',
              color: (theme) => theme.color.gray[500],
              fontWeight: 400,
            },
          }}
          value={updateDetail}
          onChange={(e) => setUpdateDetail(e.target.value)}
        />
      </Box>
      <Stack direction="row" columnGap={3} mt={3}>
        {attachment.map((el, key) => {
          return (
            <Box key={key}>
              <AttachmentCard name={el.name} fileSize={el.fileSize} fileType={el.fileType} />
            </Box>
          )
        })}
      </Stack>

      <Stack direction="row" mt={3} justifyContent="flex-end">
        <Box>
          <AttachmentIcon />
        </Box>
      </Stack>
    </>
  )
}
