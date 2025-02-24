'use client'

import { StyledMenuBox } from '@/app/detail/ui/styledComponent'
import { EditIcon, EllipsisIcon, TemplateIcon, TrashIcon } from '@/icons'
import { truncateText } from '@/utils/truncateText'
import { Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { ListBtn } from '../buttons/ListBtn'

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
        cursor: 'pointer',
        borderRadius: '4px',
        padding: '16px',
        background: (theme) => (isHovered ? theme.color.background.bgCallout : 'white'),
      }}
      onClick={(e) => {
        setTimeout(() => {
          const menuOpen = document.getElementById('template-menu-open')
          if (!menuOpen) {
            handleEdit()
          }
        }, 0)
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

      <Box
        id={isMenuOpen ? 'template-menu-open' : 'template-menu-closed'}
        sx={{ opacity: isHovered || isMenuOpen ? '100%' : '0' }}
      >
        <StyledMenuBox
          setIsMenuOpen={setIsMenuOpen}
          customIcon={<EllipsisIcon />}
          menuContent={
            <>
              <ListBtn
                content="Edit template"
                handleClick={() => handleEdit()}
                width="146px"
                icon={<EditIcon />}
                contentColor={'#212B36'}
              />
              <ListBtn
                content="Delete template"
                handleClick={() => handleDelete()}
                width="146px"
                icon={<TrashIcon />}
                contentColor={'#CC0000'}
              />
            </>
          }
          displayButtonBackground={false}
          displayBorder={false}
        />
      </Box>
    </Stack>
  )
}
