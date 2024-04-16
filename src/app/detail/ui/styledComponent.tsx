'use client'

import { KeyboardArrowRight } from '@mui/icons-material'
import { Box, Typography, styled } from '@mui/material'

export const StyledTypography = styled(Typography)(({ theme }) => ({
  color: theme.color.gray[500],
}))

export const StyledKeyboardIcon = styled(KeyboardArrowRight)(({ theme }) => ({
  color: theme.color.gray[500],
}))

export const StyledBox = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${theme.color.borders.borderDisabled}`,
}))
