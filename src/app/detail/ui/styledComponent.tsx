'use client'

import { MenuBox } from '@/components/inputs/MenuBox'
import { EmojiIcon, ReplyIcon } from '@/icons'
import { KeyboardArrowRight } from '@mui/icons-material'
import { Box, Stack, Typography, styled } from '@mui/material'

export const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
}))

export const BoldTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[700],
}))

export const StyledKeyboardIcon = styled(KeyboardArrowRight)(({ theme }) => ({
  color: theme.color.gray[500],
}))

export const StyledBox = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.color.borders.borderDisabled}`,
}))

export const VerticalLine = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: '12px',
  top: 0,
  bottom: 0,
  width: '1px',
  height: 'calc(100% + 20px)',
  backgroundColor: theme.palette.divider,
}))

export const StyledEmojiIcon = styled(EmojiIcon)(({ theme }) => ({
  '&:hover': {
    background: theme.color.gray[200],
    borderRadius: '5px',
    padding: '2px',
    transform: 'scale(1.2)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}))

export const StyledReplyIcon = styled(ReplyIcon)(({ theme }) => ({
  '&:hover': {
    background: theme.color.gray[200],
    borderRadius: '5px',
    padding: '2px',
    transform: 'scale(1.2)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}))
