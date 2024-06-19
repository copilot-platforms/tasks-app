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
import { upload } from '@vercel/blob/client'
import { AttachmentResponseSchema, CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { AttachmentInput } from '@/components/inputs/AttachmentInput'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload, UserType } from '@/types/interfaces'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { TapWriteTaskEditor } from '@/app/detail/ui/styledComponent'

interface Prop {
  title: string
  detail: string
  workflowState: WorkflowStateResponse
  task_id: string
  attachment: AttachmentResponseSchema[]
  isEditable: boolean
  updateTaskDetail: (title: string, detail: string) => void
  deleteTask: () => void
  postAttachment: (postAttachmentPayload: CreateAttachmentRequest) => void
  deleteAttachment: (id: string) => void
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
  userType: UserType
}

export const TaskEditor = ({
  title,
  detail,
  workflowState,
  task_id,
  attachment,
  isEditable,
  updateTaskDetail,
  deleteTask,
  postAttachment,
  deleteAttachment,
  getSignedUrlUpload,
  userType,
}: Prop) => {
  const [updateTitle, setUpdateTitle] = useState(title)
  const [updateDetail, setUpdateDetail] = useState(detail)
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const files = event.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const supabaseActions = new SupabaseActions()
      const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(generateRandomString(file.name))
      const filePayload = await supabaseActions.uploadAttachment(file, signedUrl, task_id)
      if (filePayload) {
        postAttachment({ ...filePayload, taskId: filePayload.id })
      }
    }
  }
  return (
    <>
      <Stack direction="row" alignItems="center" columnGap={2}>
        <Box pt="5px">{statusIcons[workflowState.type]}</Box>
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
        onBlur={() => {
          updateTaskDetail(updateTitle, updateDetail)
        }}
      >
        <TapWriteTaskEditor
          uploadFn={async (file, tiptapEditorUtils) => {
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            })
            tiptapEditorUtils.setImage(newBlob.url as string)
          }}
          content={detail}
          getContent={(content) => setUpdateDetail(content)}
          readonly={userType === UserType.CLIENT_USER}
        />
      </Box>
      <Stack direction="row" columnGap={3} rowGap={3} mt={3} flexWrap={'wrap'}>
        {attachment?.map((el, key) => {
          return (
            <Box key={key}>
              <AttachmentCard
                file={el}
                deleteAttachment={async (event: any) => {
                  event.stopPropagation()
                  const supabaseActions = new SupabaseActions()
                  const { data } = await supabaseActions.removeAttachment(el.filePath)
                  if (data && el.id) {
                    deleteAttachment(el.id)
                  }
                }}
              />
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
