import { CircularProgress } from '@mui/material'

const LoaderComponent = () => {
  return (
    <CircularProgress
      sx={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        color: '#000',
      }}
      size={40}
    />
  )
}

export default LoaderComponent
