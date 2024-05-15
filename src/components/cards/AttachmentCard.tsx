import { supabaseBucket } from '@/config'
import { CancelFilledIcon } from '@/icons'
import { supabase } from '@/lib/supabase'
import { attachmentIcons } from '@/utils/iconMatcher'
import { Box, Hidden, Stack, Typography } from '@mui/material'

interface Prop {
  name: string
  fileSize: number
  fileType: string
  filePath: string
}

export const AttachmentCard = ({ name, fileSize, fileType, filePath }: Prop) => {
  const handleDownload = async () => {
    const { data, error } = await supabase.storage.from(supabaseBucket).download(filePath)
    if (data) {
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
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
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        position: 'relative',
        '&:hover .cancelIcon': {
          display: 'block',
        },
        '&:hover': {
          border: (theme) => `2px solid ${theme.palette.divider}`,
        },
      }}
    >
      <button onClick={handleDownload} style={{ border: 'none', background: 'none', padding: 0, margin: 0 }}>
        <Box>{attachmentIcons[fileType]}</Box>
        <Stack direction="column" rowGap="7px">
          <Typography variant="sm" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {name}
          </Typography>
          <Typography variant="bodySm">{Math.floor(fileSize / 1024)} KB</Typography>
        </Stack>
        <Box
          sx={{
            display: 'none',
            position: 'absolute',
            right: 4,
            top: 4,
          }}
          className="cancelIcon"
        >
          <CancelFilledIcon />
        </Box>
      </button>
    </Stack>
  )
}
