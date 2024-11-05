'use client'

import { DownloadBtn, PdfIcon } from '@/icons'
import { attachmentIcons } from '@/utils/iconMatcher'
import { Box, Stack, Typography } from '@mui/material'
import React from 'react'
import { IconBtn } from './buttons/IconBtn'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { getFilePathFromUrl } from '@/utils/signedUrlReplacer'

const AttachmentLayout = ({
  selected,
  src,
  fileName,
  fileSize,
  fileType,
}: {
  selected: boolean
  src: string
  fileName: string
  fileSize: string
  fileType: string
}) => {
  const supabaseActions = new SupabaseActions()
  const handleDownload = () => {
    const filePath = getFilePathFromUrl(src)
    if (filePath) {
      supabaseActions.downloadAttachment(filePath, fileName)
    }
  }
  return (
    <Box
      sx={{
        padding: '4px 8px',
        maxWidth: '100%',
        border: (theme) => (selected ? `1px solid ${theme.color.gray[600]}` : `1px solid ${theme.color.gray[150]}`),
        borderRadius: '4px',
        background: '#fff',
        boxShadow: '0px 0px 24px 0px rgba(0, 0, 0, 0.07)',
        '&:hover': {
          border: (theme) => (selected ? `1px solid ${theme.color.gray[600]}` : `1px solid ${theme.color.gray[300]}`),
          '& .download-btn': {
            opacity: 1,
          },
        },
      }}
    >
      <Stack justifyContent={'space-between'} direction="row" alignItems="center">
        <Stack direction="row" columnGap="5.5px" alignItems="center">
          {attachmentIcons[fileType]}
          <Stack direction="column">
            <Typography
              variant="bodySm"
              lineHeight="21px"
              sx={{
                color: (theme) => theme.color.gray[600],
              }}
            >
              {fileName}
            </Typography>
            <Typography
              variant="bodySm"
              sx={{
                color: (theme) => theme.color.gray[500],
                fontSize: '12px',
              }}
            >
              {Math.floor(parseFloat(fileSize) / 1024)} KB
            </Typography>
          </Stack>
        </Stack>
        <Box
          className="download-btn"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <IconBtn buttonBackground="#ffffff" handleClick={handleDownload} icon={<DownloadBtn />} />
        </Box>
      </Stack>
    </Box>
  )
}

export default AttachmentLayout
