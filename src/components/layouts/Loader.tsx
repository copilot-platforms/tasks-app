import { Box, CircularProgress } from '@mui/material'

const LoaderComponent = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <CircularProgress color="inherit" size={40} />
    </Box>
  )
}

export default LoaderComponent
