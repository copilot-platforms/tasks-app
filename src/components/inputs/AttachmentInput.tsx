import { AttachmentIcon } from '@/icons'
import { Box } from '@mui/material'

export const AttachmentInput = ({
  handleFileSelect,
}: {
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <Box>
      <input id="fileInput" type="file" style={{ display: 'none' }} onChange={handleFileSelect} />
      <label htmlFor="fileInput">
        <AttachmentIcon />
      </label>
    </Box>
  )
}
