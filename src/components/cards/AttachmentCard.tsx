import { CancelFilledIcon } from '@/icons'
import { attachmentIcons } from '@/utils/iconMatcher'
import { Box, Stack, Typography } from '@mui/material'

interface Prop {
  name: string
  fileSize: string
  fileType: string
}

export const AttachmentCard = ({ name, fileSize, fileType }: Prop) => {
  return (
    <Stack
      direction="row"
      columnGap={3}
      alignItems="center"
      sx={{
        padding: '11px 8px 12px',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: '5px',
        width: '180px',
        position: 'relative',
        '&:hover .cancelIcon': {
          display: 'block',
        },
      }}
    >
      <Box>{attachmentIcons[fileType]}</Box>
      <Stack direction="column" rowGap="7px">
        <Typography variant="sm">{name}</Typography>
        <Typography variant="bodySm">{fileSize} KB</Typography>
      </Stack>
      <Box
        sx={{
          display: 'none',
          position: 'absolute',
          right: 10,
          top: 0,
        }}
        className="cancelIcon"
      >
        <CancelFilledIcon />
      </Box>
    </Stack>
  )
}
