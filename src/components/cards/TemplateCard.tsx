'use client'

import { Box, Stack, Typography } from '@mui/material'
import { ListBtn } from '../buttons/ListBtn'
import { EditIcon, TrashIcon } from '@/icons'
import { MenuBox } from '../inputs/MenuBox'

export const TemplateCard = ({
  templateName,
  handleDelete,
  handleEdit,
}: {
  templateName: string
  handleDelete: () => void
  handleEdit: () => void
}) => {
  return (
    <Stack
      direction="row"
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.border}`,
        borderRadius: '4px',
        padding: '16px 20px',
        boxShadow: '0px 6px 20px 0px rgba(0, 0, 0, 0.07)',
      }}
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="lg">{templateName}</Typography>

      <Box>
        <MenuBox
          menuContent={
            <>
              <ListBtn
                content="Edit template"
                handleClick={() => handleEdit()}
                icon={<EditIcon />}
                contentColor={'#212B36'}
              />
              <ListBtn content="Delete" handleClick={() => handleDelete()} icon={<TrashIcon />} contentColor={'#CC0000'} />
            </>
          }
        />
      </Box>
    </Stack>
  )
}
