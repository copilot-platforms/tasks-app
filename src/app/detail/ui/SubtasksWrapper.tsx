'use client'

import { NewTaskCard } from '@/app/detail/ui/NewTaskCard'
import { AddSubTaskBtn } from '@/components/buttons/AddSubTaskBtn'
import { GrayAddMediumIcon } from '@/icons'
import { Stack } from '@mui/material'
import { useState } from 'react'

export const SubtasksWrapper = () => {
  const [openTaskForm, setOpenTaskForm] = useState(false)

  const handleFormCancel = () => {
    setOpenTaskForm(false)
  }
  const handleFormOpen = () => {
    setOpenTaskForm(!openTaskForm)
  }
  return (
    <Stack direction="column" rowGap={'8px'} width="100%" sx={{ padding: '24px 0px 0px' }}>
      <AddSubTaskBtn buttonText="Create subtask" handleClick={handleFormOpen} startIcon={<GrayAddMediumIcon />} />
      {openTaskForm && <NewTaskCard handleClose={handleFormCancel} />}
    </Stack>
  )
}
