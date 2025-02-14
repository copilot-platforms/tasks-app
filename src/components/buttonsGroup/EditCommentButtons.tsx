import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { Divider, Stack, Typography } from '@mui/material'

export const EditCommentButtons = ({
  isReadOnly,
  cancelEdit,
  handleEdit,
}: {
  isReadOnly: boolean
  cancelEdit: () => void
  handleEdit: () => void
}) => {
  return (
    !isReadOnly && (
      <Stack
        direction="row"
        columnGap={'12px'}
        sx={{
          alignSelf: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Divider orientation="vertical" sx={{ height: '28px' }} />
        <SecondaryBtn
          width={'46px'}
          outlined
          handleClick={cancelEdit}
          buttonContent={
            <Typography variant="sm" sx={{ color: (theme) => theme.color.text.text }}>
              Cancel
            </Typography>
          }
        />
        <SecondaryBtn
          width={'46px'}
          handleClick={() => {
            handleEdit()
          }}
          buttonContent={
            <Typography variant="sm" sx={{ color: (theme) => theme.color.text.text }}>
              Save
            </Typography>
          }
        />
      </Stack>
    )
  )
}
