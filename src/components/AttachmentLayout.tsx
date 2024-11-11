'use client'

import { DownloadBtn, PdfIcon } from '@/icons'
import { attachmentIcons } from '@/utils/iconMatcher'
import { Box, Skeleton, Stack, Typography, SxProps, Theme } from '@mui/material'
import React from 'react'
import { IconBtn } from './buttons/IconBtn'
import { useDownloadFile } from '@/hooks/useDownload'

interface AttachmentLayoutProps {
  selected: boolean
  src: string
  fileName: string
  fileSize: string
  fileType: string
  isUploading: boolean
}

const AttachmentLayout: React.FC<AttachmentLayoutProps> = ({ selected, src, fileName, fileSize, fileType, isUploading }) => {
  const { handleDownload, isDownloading } = useDownloadFile()

  const onDownloadClick = () => {
    handleDownload(src, fileName)
  }

  const containerStyles: SxProps<Theme> = {
    padding: { xs: '4px 8px', md: '4px 12px 4px 8px' },
    marginTop: '4px !important',
    marginBottom: '4px',
    maxWidth: '100%',
    borderRadius: '4px',
    background: '#fff',
    boxShadow: '0px 0px 24px 0px rgba(0, 0, 0, 0.07)',
    border: (theme) => `1px solid ${theme.color.gray[selected ? 600 : 150]}`,

    '@media (max-width: 600px)': {
      '&:active': {
        border: (theme) => `1px solid ${theme.color.gray[600]}`,
      },
    },

    '@media (min-width: 600px)': {
      '&:hover': {
        border: (theme) => `1px solid ${theme.color.gray[selected ? 600 : 300]}`,
        '& .download-btn': {
          opacity: 1,
        },
      },
    },
  }

  const downloadBtnStyles: SxProps<Theme> = {
    opacity: {
      xs: 1,
      sm: 0,
    },
    transition: 'opacity 0.2s ease',
  }

  const renderContent = () => {
    if (isUploading) {
      return (
        <Stack justifyContent="space-between" direction="row" alignItems="center">
          <Stack direction="row" columnGap="5.5px" alignItems="center">
            <Skeleton variant="rectangular" width={24} height={24} />
            <Stack direction="column">
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={80} height={16} />
            </Stack>
          </Stack>
          <Box className="download-btn" sx={downloadBtnStyles}>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        </Stack>
      )
    }

    return (
      <Stack justifyContent="space-between" direction="row" alignItems="center" sx={{ width: '100%' }}>
        <Stack direction="row" columnGap="5.5px" alignItems="center" sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {attachmentIcons[fileType] || attachmentIcons['default']}
          <Stack direction="column" sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="bodySm"
              sx={{
                color: (theme) => `${theme.color.gray[600]} !important`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '21px',
                width: { xs: '250px', sd: '400px', md: '500px' },
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
            ...downloadBtnStyles,
            flexShrink: 0,
            marginLeft: '8px',
          }}
        >
          <IconBtn buttonBackground="#ffffff" handleClick={onDownloadClick} icon={<DownloadBtn />} />
        </Box>
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        ...containerStyles,
        '&:hover': {
          border: (theme) => `1px solid ${theme.color.gray[selected ? 600 : 300]}`,
          '& .download-btn': {
            opacity: 1,
          },
        },
      }}
    >
      {renderContent()}
    </Box>
  )
}

export default AttachmentLayout
