import { Stack, Typography } from '@mui/material'

export const DeletedCommentCard = () => {
  return (
    <Stack sx={{ paddingBottom: '4px' }}>
      <Typography
        variant="bodyMd"
        sx={{
          color: (theme) => theme.color.text.text,
        }}
      >
        This message was deleted
      </Typography>
    </Stack>
  )
}
