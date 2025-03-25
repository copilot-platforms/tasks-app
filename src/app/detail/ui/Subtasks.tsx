'use client'

import { useState } from 'react'
import { Stack } from '@mui/material'

import { NewTaskCard } from '@/app/detail/ui/NewTaskCard'
import { GhostBtn } from '@/components/buttons/GhostBtn'
import { GrayAddMediumIcon } from '@/icons'

export const Subtasks = () => {
  const [openTaskForm, setOpenTaskForm] = useState(false)

  const handleFormCancel = () => {
    setOpenTaskForm(false)
  }
  const handleFormOpen = () => {
    setOpenTaskForm(!openTaskForm)
  }
  return (
    <Stack direction="column" rowGap={'8px'} width="100%" sx={{ padding: '24px 0px 0px' }}>
      <GhostBtn buttonText="Create subtask" handleClick={handleFormOpen} startIcon={<GrayAddMediumIcon />} />
      {openTaskForm && <NewTaskCard handleClose={handleFormCancel} />}
    </Stack>
  )
}
