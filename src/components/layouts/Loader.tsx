import { Box, CircularProgress } from '@mui/material'

const LoaderComponent = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        alignItems: 'center',
      }}
    >
      <CircularProgress
        sx={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          color: '#000',
        }}
        size={40}
      />
    </Box>
  )
}

export default LoaderComponent
