'use client'

import { CrossIconSmall, DownloadBtn } from '@/icons'
import { attachmentIcons, attachmentIconsSmall } from '@/utils/iconMatcher'
import { Box, Skeleton, Stack, Typography, SxProps, Theme, useMediaQuery } from '@mui/material'
import React, { useEffect } from 'react'
import { useDownloadFile } from '@/hooks/useDownload'

interface AttachmentLayoutProps {
  selected: boolean
  src: string
  fileName: string
  fileSize: string
  fileType: string
  isUploading: boolean
  onDelete: () => void
  isEditable: boolean
  isComment?: boolean
  onUploadStatusChange?: (uploading: boolean) => void
}

const AttachmentLayout: React.FC<AttachmentLayoutProps> = ({
  selected,
  src,
  fileName,
  fileSize,
  fileType,
  isUploading,
  onDelete,
  isEditable,
  isComment,
  onUploadStatusChange,
}) => {
  const { handleDownload, isDownloading } = useDownloadFile()
  const isXsScreen = useMediaQuery((theme: Theme) => `(max-width:${theme.breakpoints.values.sm}px)`)
  const onDownloadClick = () => {
    handleDownload(src, fileName)
  }

  useEffect(() => {
    if (onUploadStatusChange) {
      onUploadStatusChange(isUploading)
    }
  }, [isUploading, onUploadStatusChange])

  const containerStyles: SxProps<Theme> = {
    width: '100%',
    maxWidth: '100%',
    borderRadius: '4px',
    margin: '8px auto !important',
    padding: { xs: '8px 6px 8px 8px', sm: '4px 8px', md: '4px 12px 4px 8px' },
    border: (theme) => `1px solid ${theme.color.gray[selected ? 600 : 150]}`,
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box',
    '&:focus': {
      outline: 'none',
    },
    '&:focus-visible': {
      border: (theme) => `1.5px solid ${theme.color.borders.focusBorder}`,
    },
    '@media (max-width: 600px)': {
      '&:active': {
        border: selected ? (theme) => `1px solid ${theme.color.gray[600]}` : 'none',
      },
    },

    '@media (min-width: 600px)': {
      '&:hover': {
        border: (theme) => `1px solid ${theme.color.gray[selected ? 600 : 300]}`,
        '& .download-btn': {
          opacity: 1,
          cursor: 'pointer',
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
    padding: '4px',
    ':hover': {
      background: (theme) => theme.color.gray[100],
      borderRadius: '2px',
    },
  }

  const renderContent = () => {
    if (isUploading) {
      return (
        <Stack justifyContent="space-between" direction="row" alignItems="center" width="100%">
          <Stack direction="row" columnGap="5.5px" alignItems="center" sx={{ flex: 1, overflow: 'hidden' }}>
            <Skeleton variant="rectangular" width={24} height={24} />
            <Stack direction="column" sx={{ flex: 1, overflow: 'hidden' }}>
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
      <Stack justifyContent="space-between" direction="row" alignItems="center" width="100%" sx={{ maxWidth: '100%' }}>
        <Stack direction="row" columnGap="5.5px" alignItems="center" sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
          {isXsScreen
            ? attachmentIconsSmall[fileType] || attachmentIconsSmall['default']
            : attachmentIcons[fileType] || attachmentIcons['default']}
          <Stack direction="column" sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
            <Typography
              variant="bodySm"
              sx={{
                color: (theme) => `${theme.color.gray[600]} !important`,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: '21px',
                maxWidth: '100%',
              }}
            >
              {fileName}
            </Typography>
            {!isXsScreen && (
              <Typography
                variant="bodySm"
                sx={{
                  color: (theme) => theme.color.gray[500],
                  fontSize: '12px',
                }}
              >
                {Math.floor(parseFloat(fileSize) / 1024)} KB
              </Typography>
            )}
          </Stack>
        </Stack>
        {isEditable && isComment ? (
          <Box
            className="download-btn"
            sx={{
              ...downloadBtnStyles,
              flexShrink: 0,
              marginLeft: '8px',
            }}
            onClick={onDelete}
          >
            <CrossIconSmall />
          </Box>
        ) : (
          <Box
            className="download-btn"
            sx={{
              ...downloadBtnStyles,
              flexShrink: 0,
              marginLeft: '8px',
            }}
            onClick={onDownloadClick}
          >
            <DownloadBtn />
          </Box>
        )}
      </Stack>
    )
  }

  return (
    <Box
      tabIndex={0}
      sx={{
        ...containerStyles,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
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
