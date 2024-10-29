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
import { Attachment } from '@prisma/client'

interface Prop {
  file: AttachmentResponseSchema | CreateAttachmentRequest | Attachment
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
        columnGap={'8px'}
        alignItems="center"
        sx={{
          padding: '4px 8px ',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          width: '100%',
          height: '49px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          position: 'relative',
          '&:hover .cancelIcon': {
            display: 'block',
          },
          '&:hover': {
            outline: (theme) => `1px solid ${theme.color.gray[300]}`,
          },
          '&:focus': {
            outline: (theme) => `1.5px solid ${theme.color.gray[600]}`,
          },
        }}
      >
        <Box>{attachmentIcons[fileType]}</Box>
        <Stack direction="column" rowGap="0px">
          <Typography
            variant="bodySm"
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: '21px' }}
            title={fileName}
          >
            {fileName}
          </Typography>
          <Typography variant="bodySm" sx={{ fontSize: '12px', color: (theme) => theme.color.gray[500] }}>
            {Math.floor(fileSize / 1024)} KB
          </Typography>
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
