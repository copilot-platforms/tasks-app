import { TrashIcon } from '@/icons'
import { Box, Stack, Typography } from '@mui/material'

export const ListBtn = ({ content, handleClick }: { content: string; handleClick: () => void }) => {
  return (
    <Box
      p="4px 0px"
      sx={{
        border: (theme) => `1px solid ${theme.color.gray[150]}`,
        borderRadius: '4px',
        width: '138px',
        cursor: 'pointer',
      }}
      onClick={handleClick}
    >
      <Stack
        direction="row"
        columnGap={'10px'}
        sx={{
          backgroundColor: (theme) => theme.color.background.bgCallout,
        }}
        p="9px 12px"
      >
        <Box>
          <TrashIcon />
        </Box>
        <Typography variant="bodySm" color="#CC0000">
          {content}
        </Typography>
      </Stack>
    </Box>
  )
}
