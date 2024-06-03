import { Avatar, Box, InputAdornment, Stack } from '@mui/material'
import { StyledTextField } from './TextField'
import { PrimaryBtn } from '../buttons/PrimaryBtn'
import { AttachmentIcon } from '@/icons'

export const CommentInput = () => {
  return (
    <Stack direction="row" columnGap={2} alignItems="flex-start">
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px' }} />
      <StyledTextField
        type="text"
        multiline
        sx={{
          width: '100%',
          '& .MuiInputBase-input': {
            fontSize: '16px',
            lineHeight: '28px',
            color: (theme) => theme.color.gray[600],
            fontWeight: 400,
          },
        }}
        placeholder={'Leave a comment...'}
        rows={4}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                alignSelf: 'flex-end',
                display: 'flex',
                alignItems: 'flex-end',
                paddingBottom: '10px',
              }}
            >
              <Stack direction="row" columnGap={6}>
                <input id="fileInput" type="file" style={{ display: 'none' }} onChange={() => {}} />
                <label htmlFor="fileInput">
                  <AttachmentIcon />
                </label>
                <PrimaryBtn buttonText="Comment" handleClick={() => {}} />
              </Stack>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  )
}
