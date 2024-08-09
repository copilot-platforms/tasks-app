import { useMediaQuery } from '@mui/material'

export const GetMaxAssigneeNameWidth = (taskDueDate: string | undefined) => {
  const small = useMediaQuery('(max-width: 400px)')
  const medium = useMediaQuery('(max-width: 500px)')
  const large = useMediaQuery('(max-width: 600px)')
  if (small) return taskDueDate ? '80px' : '150px'
  if (medium) return taskDueDate ? '120px' : '220px'
  if (large) return taskDueDate ? '200px' : '300px'
  return 'auto'
}
