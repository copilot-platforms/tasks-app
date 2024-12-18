'use client'

import { ListBtn } from '@/components/buttons/ListBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { EmojiIcon, ReplyIcon, TemplateIcon } from '@/icons'
import { KeyboardArrowRight } from '@mui/icons-material'
import { Box, Stack, Typography, styled } from '@mui/material'
import Link from 'next/link'
import { Tapwrite } from 'tapwrite'

export const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
  fontSize: theme.typography.md.fontSize,
}))

export const BoldTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[600],
  fontSize: theme.typography.md.fontSize,
  lineHeight: '22px',
}))

export const AvatarTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.base.white,
  fontSize: theme.typography.bodyMd.fontSize,
}))

export const TypographyContainer = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
}))

export const StyledKeyboardIcon = styled(KeyboardArrowRight)(({ theme }) => ({
  color: theme.color.gray[500],
}))

export const StyledBox = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.color.borders.borderDisabled}`,
  width: '100%',
}))
export const StyledTiptapDescriptionWrapper = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.color.borders.borderDisabled}`,
  width: '100%',
  '.tiptap *': {
    color: theme.color.gray[500],
  },
  '.tiptap p': {
    fontSize: '16px',
  },
}))

export const VerticalLine = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: '12px',
  top: 0,
  bottom: 0,
  width: '1px',
  height: 'calc(100% + 20px)',
  backgroundColor: theme.color.gray[150],
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

export const CommentCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '8px',
  width: '100%',
}))

export const TaskDetailsContainer = styled(Box)(({ theme }) => ({
  maxWidth: '672px',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  margin: '0 auto',

  display: 'flex',
  flexDirection: 'column',
}))

export const StyledMenuBox = styled(MenuBox)(({ theme }) => ({
  div: {
    background: theme.color.gray[150],
    padding: '4px',
  },
  svg: {
    height: '12px',
    width: '12px',
  },
}))
