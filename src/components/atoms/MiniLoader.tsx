import { SxCenter } from '@/utils/mui'
import { Box, CircularProgress } from '@mui/material'

interface MiniLoaderProps {
  size?: number
}

export const MiniLoader = ({ size }: MiniLoaderProps) => {
  return (
    <Box sx={{ ...SxCenter, height: '28px' }}>
      <CircularProgress sx={{ color: '#000' }} size={size || 14} />
    </Box>
  )
}
