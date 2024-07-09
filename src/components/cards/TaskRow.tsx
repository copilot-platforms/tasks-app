'use client'

import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { Add, MoreHoriz } from '@mui/icons-material'
import { Typography, Box, Stack, IconButton } from '@mui/material'
import { ReactNode } from 'react'

interface Prop {
  children: ReactNode
  columnName: string
  taskCount: string
  showConfigurableIcons: boolean
  display?: boolean
}

export const TaskRow = ({ children, columnName, taskCount, showConfigurableIcons, display = true }: Prop) => {
  return display ? (
    <Box>
      <Box
        sx={{
          background: (theme) => theme.color.gray[100],
          borderBottom: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        }}
      >
        <AppMargin size={SizeofAppMargin.LARGE} py="6px">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" columnGap={2}>
              <Typography variant="md">{columnName}</Typography>
              <Typography
                variant="sm"
                sx={{
                  color: (theme) => theme.color.gray[400],
                }}
              >
                {taskCount}
              </Typography>
            </Stack>

            {showConfigurableIcons && (
              <Stack direction="row" alignItems="center">
                <IconButton
                  aria-label="menu"
                  sx={{
                    padding: '3px',
                  }}
                >
                  <MoreHoriz fontSize="small" />
                </IconButton>
                <IconButton
                  aria-label="add"
                  sx={{
                    padding: '3px',
                  }}
                >
                  <Add fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Stack>
        </AppMargin>
      </Box>
      {children}
    </Box>
  ) : null
}
