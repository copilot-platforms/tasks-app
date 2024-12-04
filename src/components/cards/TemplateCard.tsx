'use client'

import { Box, Stack, Typography } from '@mui/material'
import { ListBtn } from '../buttons/ListBtn'
import { EditIcon, TemplateIcon, TrashIcon } from '@/icons'
import { MenuBox } from '../inputs/MenuBox'
import { useState } from 'react'
import { StyledMenuBox } from '@/app/detail/ui/styledComponent'
import { truncateText } from '@/utils/truncateText'

interface TemplateCardProps {
  title: string
  handleDelete: () => void
  handleEdit: () => void
}

export const TemplateCard = ({ title, handleDelete, handleEdit }: TemplateCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const handleMouseHover = () => !isHovered && setIsHovered(true)
  const handleMouseLeave = () => isHovered && setIsHovered(false)

  return (
    <Stack
      direction="row"
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.border}`,
        borderRadius: '4px',
        padding: '16px',
        background: (theme) => (isHovered ? theme.color.background.bgCallout : 'white'),
      }}
      justifyContent="space-between"
      alignItems="center"
      onMouseEnter={handleMouseHover}
      onMouseLeave={handleMouseLeave}
    >
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center', height: '20px' }}>
        <TemplateIcon />
        <Typography variant="bodyMd">{truncateText(title, 38)}</Typography>
      </Box>

      <Box sx={{ opacity: isHovered || isMenuOpen ? '100%' : '0' }}>
        <StyledMenuBox
          setIsMenuOpen={setIsMenuOpen}
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
          displayButtonBackground={false}
          displayBorder={false}
        />
      </Box>
    </Stack>
  )
}
