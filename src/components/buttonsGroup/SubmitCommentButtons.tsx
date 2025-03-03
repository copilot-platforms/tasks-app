import { ArrowUpward } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'

export const SubmitCommentButtons = ({ handleSubmit }: { handleSubmit: () => void }) => {
  return (
    <Box
      sx={{
        alignSelf: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IconButton
        onClick={handleSubmit}
        sx={{
          backgroundColor: '#000',
          borderRadius: '4px',
          padding: '5px',
          '&:hover': { bgcolor: '#000' },
          height: '24px',
          width: '24px',
        }}
      >
        <ArrowUpward sx={{ color: '#ffffff', fontSize: '18px' }} />
      </IconButton>
    </Box>
  )
}
