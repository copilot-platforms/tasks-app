'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { Box, Modal, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import store from '@/redux/store'
import { upload } from '@vercel/blob/client'
import { AttachmentResponseSchema, CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { AttachmentInput } from '@/components/inputs/AttachmentInput'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { generateRandomString } from '@/utils/generateRandomString'
import { ISignedUrlUpload, UserType } from '@/types/interfaces'
import { advancedFeatureFlag } from '@/config'
import { Tapwrite } from 'tapwrite'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { useDebounce } from '@/hooks/useDebounce'
import { TaskResponse } from '@/types/dto/tasks.dto'

interface Prop {
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
  const { tasks } = useSelector(selectTaskBoard)
  const [isTyping, setIsTyping] = useState(false)
  const [updateTitle, setUpdateTitle] = useState('')
  const [tempUpdateTitle, setTempUpdateTitle] = useState('')
  const [updateDetail, setUpdateDetail] = useState('')
  const [tempUpdateDetail, setTempUpdateDetail] = useState('')
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
        postAttachment({ ...filePayload, taskId: filePayload.taskId })
      }
    }
  }

  useEffect(() => {
    const currentTask = tasks.find((el) => el.id === task_id)
    setUpdateTitle(currentTask?.title || '')
    setUpdateDetail(currentTask?.body ?? '')
  }, [tasks, task_id])

  useEffect(() => {
    const currentTask = tasks.find((el) => el.id === task_id)
    setTempUpdateDetail(currentTask?.body || '')
    setTempUpdateTitle(currentTask?.title || '')
  }, [isTyping])

  const _taskUpdateDebounced = async (title: string, details: string) => {
    updateTaskDetail(title, details)
  }

  const taskUpdateDebounced = useDebounce(_taskUpdateDebounced)

  const handleBlur = () => {
    setIsTyping(false)
    setUpdateTitle(tempUpdateTitle)
    setUpdateDetail(tempUpdateDetail)
    updateTaskDetail(tempUpdateTitle, tempUpdateDetail)
  }

  return (
    <>
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
          '& .MuiInputBase-root': {
            padding: '0px 0px',
          },
        }}
        value={isTyping ? tempUpdateTitle : updateTitle}
        onChange={(e) => {
          setIsTyping(true)
          setTempUpdateTitle(e.target.value)
          taskUpdateDebounced(e.target.value, tempUpdateDetail)
        }}
        InputProps={{ readOnly: !isEditable }}
        inputProps={{ maxLength: 255 }}
        disabled={!isEditable}
        padding="0px"
        onBlur={handleBlur}
      />

      <Box onBlur={handleBlur} mt="12px">
        <Tapwrite
          uploadFn={async (file, tiptapEditorUtils) => {
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            })
            tiptapEditorUtils.setImage(newBlob.url as string)
          }}
          content={isTyping ? tempUpdateDetail : updateDetail}
          getContent={(content) => {
            setIsTyping(true)
            setTempUpdateDetail(content)
            taskUpdateDebounced(tempUpdateTitle, content)
          }}
          readonly={userType === UserType.CLIENT_USER}
          editorClass="tapwrite-details-page"
          placeholder="Add description..."
        />
      </Box>
      {advancedFeatureFlag && (
        <>
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
        </>
      )}

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
