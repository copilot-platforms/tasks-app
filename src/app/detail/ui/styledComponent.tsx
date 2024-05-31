'use client'

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
  left: '10px',
  top: 0,
  bottom: 0,
  width: '1px',
  height: 'auto',
  backgroundColor: theme.palette.divider,
  transform: 'translateY(80%)',
}))

export const WrapperStack = styled(Stack)({
  position: 'relative',
  alignItems: 'flex-start',
  gap: '4px',
})
