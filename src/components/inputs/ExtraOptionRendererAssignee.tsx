import { Avatar, Box, Stack, Typography } from '@mui/material'
import React, { HTMLAttributes, MouseEvent } from 'react'

interface ExtraOptionRendererAssigneeProps {
  props?: HTMLAttributes<HTMLElement>
  onClick: (e: MouseEvent<HTMLLIElement>) => void
}

const ExtraOptionRendererAssignee: React.FC<ExtraOptionRendererAssigneeProps> = ({ props, onClick }) => {
  return (
    <Box
      component="li"
      {...props}
      sx={{
        '&.MuiAutocomplete-option[aria-selected="true"]': {
          bgcolor: (theme) => theme.color.gray[100],
        },
        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
          bgcolor: (theme) => theme.color.gray[100],
        },
      }}
      onClick={onClick}
    >
      <Stack direction="row" alignItems="center" columnGap={3}>
        <Avatar alt="user" sx={{ width: '20px', height: '20px' }} />
        <Typography variant="sm" fontWeight={400}>
          No assignee
        </Typography>
      </Stack>
    </Box>
  )
}

export default ExtraOptionRendererAssignee
