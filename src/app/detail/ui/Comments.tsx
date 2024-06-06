import { Avatar, Box, Stack } from '@mui/material'
import { VerticalLine } from './styledComponent'
import { CommentCard } from '@/components/cards/CommentCard'

interface Prop {
  comment: any
}

export const Comments = ({ comment }: Prop) => {
  return (
    <Stack direction="row" columnGap={2} position="relative">
      <VerticalLine />
      <Avatar alt="user" src={''} sx={{ width: '25px', height: '25px', marginTop: '5px' }} />
      <CommentCard comment={comment} />
    </Stack>
  )
}
