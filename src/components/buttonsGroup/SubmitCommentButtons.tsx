import { ArrowUpward } from '@mui/icons-material'
import { Box, IconButton } from '@mui/material'

export const SubmitCommentButtons = ({ handleSubmit, disabled }: { handleSubmit: () => void; disabled?: boolean }) => {
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
        onClick={
          disabled
            ? () => {
                console.warn('File is currently uploading')
              }
            : handleSubmit
        }
        sx={{
          backgroundColor: '#000',
          borderRadius: '4px',
          padding: '5px',
          '&:hover': { bgcolor: '#000' },
          height: '24px',
          width: '24px',
          ...(disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
          }),
        }}
      >
        <ArrowUpward sx={{ color: '#ffffff', fontSize: '18px' }} />
      </IconButton>
    </Box>
  )
}
