'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { Box, Modal, Stack } from '@mui/material'
import { useEffect, useState, useCallback, useRef } from 'react'
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
  //test purpose only
  const { tasks } = useSelector(selectTaskBoard)
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateDetail, setUpdateDetail] = useState('')
  const [isUserTyping, setIsUserTyping] = useState(false)
  const skipUpdate = useRef(false)
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)

  const originalTask = useRef({ title: '', body: '' })

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
    if (!skipUpdate.current) {
      const currentTask = tasks.find((el) => el.id === task_id)
      if (currentTask) {
        setUpdateTitle(currentTask.title || '')
        setUpdateDetail(currentTask.body ?? '')
        originalTask.current = { title: currentTask.title || '', body: currentTask.body || '' }
      }
    } else {
      skipUpdate.current = false
    }
  }, [tasks, task_id])

  const _taskUpdateDebounced = async (title: string, details: string) => {
    const currentTask = tasks.find((el) => el.id === task_id)
    if (currentTask) {
      const newTitle = title !== originalTask.current.title ? title : currentTask.title
      const newDetail = details !== originalTask.current.body ? details : currentTask.body

      updateTaskDetail(newTitle as string, newDetail ?? '')
    }
  }

  const taskUpdateDebounced = useDebounce(_taskUpdateDebounced)

  const resetTypingFlag = useCallback(() => {
    setIsUserTyping(false)
    skipUpdate.current = true
  }, [])

  const debouncedResetTypingFlag = useDebounce(resetTypingFlag, 1000)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setUpdateTitle(newTitle)
    setIsUserTyping(true)
    taskUpdateDebounced(newTitle, updateDetail)
    debouncedResetTypingFlag()
  }

  const handleDetailChange = (content: string) => {
    setUpdateDetail(content)
    setIsUserTyping(true)
    taskUpdateDebounced(updateTitle, content)
    debouncedResetTypingFlag()
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
        value={updateTitle}
        onChange={handleTitleChange}
        InputProps={{ readOnly: !isEditable }}
        inputProps={{ maxLength: 255 }}
        disabled={!isEditable}
        padding="0px"
      />

      <Box mt="12px">
        <Tapwrite
          uploadFn={async (file, tiptapEditorUtils) => {
            const newBlob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/upload',
            })
            tiptapEditorUtils.setImage(newBlob.url as string)
          }}
          content={updateDetail}
          getContent={handleDetailChange}
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
