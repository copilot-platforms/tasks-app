'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { AttachmentIcon } from '@/icons'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { statusIcons } from '@/utils/iconMatcher'
import { Box, Modal, Stack } from '@mui/material'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import store from '@/redux/store'
import { NotionLike, TiptapEditorUtils } from 'notion-like'
import { upload } from '@vercel/blob/client'

type Attachment = {
  name: string
  fileSize: string
  fileType: string
}

interface Prop {
  title: string
  detail: string
  attachment: Attachment[]
  isEditable: boolean
  updateTaskDetail: (title: string, detail: string) => void
  deleteTask: () => void
}

export const TaskEditor = ({ title, detail, attachment, isEditable, updateTaskDetail, deleteTask }: Prop) => {
  const [updateTitle, setUpdateTitle] = useState(title)
  const [updateDetail, setUpdateDetail] = useState(detail)
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

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
      <Box>
        <NotionLike
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
        {attachment.map((el, key) => {
          return (
            <Box key={key}>
              <AttachmentCard name={el.name} fileSize={el.fileSize} fileType={el.fileType} />
            </Box>
          )
        })}
      </Stack>

      <Stack direction="row" mt={3} justifyContent="flex-end">
        <Box>
          <AttachmentIcon />
        </Box>
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
