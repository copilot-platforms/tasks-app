import { CancelFilledIcon } from '@/icons'
import {
  AttachmentResponseSchema,
  CreateAttachmentRequest,
  CreateAttachmentRequestSchema,
} from '@/types/dto/attachments.dto'
import { TruncateMaxNumber } from '@/types/constants'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { attachmentIcons } from '@/utils/iconMatcher'
import { truncateText } from '@/utils/truncateText'
import { Box, Stack, Typography } from '@mui/material'

interface Prop {
  file: AttachmentResponseSchema | CreateAttachmentRequest
  deleteAttachment: (event: React.MouseEvent<HTMLDivElement>) => void
}

export const AttachmentCard = ({ file, deleteAttachment }: Prop) => {
  const { fileName, filePath, fileType, fileSize } = CreateAttachmentRequestSchema.parse(file)
  const supabaseActions = new SupabaseActions()
  return (
    <div
      onClick={() => {
        supabaseActions.downloadAttachment(filePath, fileName)
      }}
      style={{ cursor: 'pointer', padding: 0, margin: 0 }}
    >
      <Stack
        direction="row"
        columnGap={3}
        alignItems="center"
        sx={{
          padding: '13px 8px 12px',
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
        <Box>{attachmentIcons[fileType]}</Box>
        <Stack direction="column" rowGap="7px">
          <Typography
            variant="sm"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100px' }}
          >
            {fileName}
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
          onClick={(e) => {
            deleteAttachment(e)
          }}
        >
          <CancelFilledIcon />
        </Box>
      </Stack>
    </div>
  )
}
