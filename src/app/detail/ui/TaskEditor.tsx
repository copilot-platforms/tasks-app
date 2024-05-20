'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { AttachmentIcon } from '@/icons'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { statusIcons } from '@/utils/iconMatcher'
import { Box, IconButton, Modal, Stack } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import store from '@/redux/store'
import { Tapwrite, TiptapEditorUtils } from 'tapwrite'
import { upload } from '@vercel/blob/client'
import { AttachmentResponseSchema, CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { AttachmentInput } from '@/components/inputs/AttachmentInput'
import { SupabaseActions } from '@/utils/SupabaseActions'

interface Prop {
  title: string
  detail: string
  task_id: string
  attachment: AttachmentResponseSchema[]
  isEditable: boolean
  updateTaskDetail: (title: string, detail: string) => void
  deleteTask: () => void
  postAttachment: (postAttachmentPayload: CreateAttachmentRequest) => void
  deleteAttachment: (id: string) => void
}

export const TaskEditor = ({
  title,
  detail,
  task_id,
  attachment,
  isEditable,
  updateTaskDetail,
  deleteTask,
  postAttachment,
  deleteAttachment,
}: Prop) => {
  const [updateTitle, setUpdateTitle] = useState(title)
  const [updateDetail, setUpdateDetail] = useState(detail)
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const supabaseActions = new SupabaseActions()
    const filePayload = await supabaseActions.uploadAttachment(event, task_id)
    if (filePayload) {
      postAttachment(filePayload)
    }
  }
  return (
    <>
      <Stack direction="row" alignItems="center" columnGap={2}>
        <Box pt="5px">{statusIcons['unstarted']}</Box>
        <StyledTextField
          type="text"
          multiline
          borderLess
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              fontSize: '20px',
              lineHeight: '28px',
              color: (theme) => theme.color.gray[600],
              fontWeight: 500,
            },
          }}
          value={updateTitle}
          onChange={(e) => setUpdateTitle(e.target.value)}
          InputProps={{ readOnly: !isEditable }}
          disabled={!isEditable}
          onBlur={() => {
            updateTaskDetail(updateTitle, updateDetail)
          }}
        />
      </Stack>
      <Box
        sx={{
          minHeight: '30vh',
        }}
      >
        <Tapwrite
          uploadFn={async (file, tiptapEditorUtils) => {
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            })
            tiptapEditorUtils.setImage(newBlob.url as string)
          }}
          content={detail}
          getContent={(content) => setUpdateDetail(content)}
        />
      </Box>
      <Stack direction="row" columnGap={3} mt={3}>
        {attachment?.map((el, key) => {
          return (
            <Box key={key}>
              <AttachmentCard file={el} deleteAttachment={deleteAttachment} />
            </Box>
          )
        })}
      </Stack>

      <Stack direction="row" mt={3} justifyContent="flex-end">
        <AttachmentInput handleFileSelect={handleFileSelect} />
      </Stack>

      <Modal
        open={showConfirmDeleteModal}
        onClose={() => store.dispatch(setShowConfirmDeleteModal())}
        aria-labelledby="delete-task-modal"
        aria-describedby="delete-task"
      >
        <ConfirmDeleteUI
          handleCancel={() => store.dispatch(setShowConfirmDeleteModal())}
          handleDelete={() => {
            deleteTask()
            store.dispatch(setShowConfirmDeleteModal())
          }}
        />
      </Modal>
    </>
  )
}
