'use client'
import { TemplateCard } from '@/components/cards/TemplateCard'
import { selectCreateTemplate, setShowTemplateModal } from '@/redux/features/templateSlice'
import { Modal, Stack } from '@mui/material'
import { useSelector } from 'react-redux'
import { TemplateForm } from './TemplateForm'
import store from '@/redux/store'

export const TemplateBoard = () => {
  const { showTemplateModal } = useSelector(selectCreateTemplate)

  return (
    <>
      <Stack
        direction="column"
        py="40px"
        sx={{
          width: '60%',
          margin: '0 auto',
        }}
        rowGap={4}
      >
        <TemplateCard templateName={'Onboarding'} />
        <TemplateCard templateName={'Sessions'} />
      </Stack>

      <Modal
        open={showTemplateModal}
        onClose={() => {
          store.dispatch(setShowTemplateModal())
        }}
        aria-labelledby="create-task-modal"
        aria-describedby="add-new-task"
      >
        <TemplateForm handleCreate={() => {}} />
      </Modal>
    </>
  )
}
