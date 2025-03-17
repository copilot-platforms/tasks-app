import { Stack, Typography } from '@mui/material'

export const DeletedCommentCard = () => {
  return (
    <Stack sx={{ padding: '8px' }}>
      <Typography
        variant="bodyMd"
        sx={{
          color: (theme) => theme.color.text.text,
        }}
      >
        This comment was deleted.
      </Typography>
    </Stack>
  )
}
