'use client'

import { AttachmentCard } from '@/components/cards/AttachmentCard'
import { StyledTextField } from '@/components/inputs/TextField'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { Box, Modal, Stack } from '@mui/material'
import { useEffect, useState, useCallback } from 'react'
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
import { useRouter } from 'next/navigation'
import { RESOURCE_NOT_FOUND_REDIRECT_PATHS } from '@/utils/redirect'

interface Prop {
  task_id: string
  attachment: AttachmentResponseSchema[]
  isEditable: boolean
  updateTaskDetail: (detail: string) => void
  updateTaskTitle: (title: string) => void
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
  updateTaskTitle,
  deleteTask,
  postAttachment,
  deleteAttachment,
  getSignedUrlUpload,
  userType,
}: Prop) => {
  const { tasks, token } = useSelector(selectTaskBoard)
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateDetail, setUpdateDetail] = useState('')
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)
  const [isUserTyping, setIsUserTyping] = useState(false)

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

  const router = useRouter()

  useEffect(() => {
    const currentTask = tasks.find((el) => el.id === task_id)
    if (!currentTask) {
      router.push(`${RESOURCE_NOT_FOUND_REDIRECT_PATHS[userType]}?token=${token}`)
      return // Just to keep TSC happy below
    }

    if (!isUserTyping) {
      setUpdateTitle(currentTask.title || '')
      setUpdateDetail(currentTask.body ?? '')
    }
  }, [tasks, task_id, isUserTyping])

  const _titleUpdateDebounced = async (title: string) => updateTaskTitle(title)

  const titleUpdateDebounced = useDebounce(_titleUpdateDebounced)

  const _detailsUpdateDebounced = async (details: string) => updateTaskDetail(details)
  const detailsUpdateDebounced = useDebounce(_detailsUpdateDebounced)

  const resetTypingFlag = useCallback(() => {
    setIsUserTyping(false)
    if (userType === UserType.INTERNAL_USER) {
      router.prefetch(`/?token=${token}`)
    } else {
      router.prefetch(`/client?token=${token}`)
    }
  }, [])

  const debouncedResetTypingFlag = useDebounce(resetTypingFlag, 1500)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    if (newTitle.trim() == '') {
      return
    }
    setUpdateTitle(newTitle)
    setIsUserTyping(true)
    titleUpdateDebounced(newTitle)
    debouncedResetTypingFlag()
  }

  const handleDetailChange = (content: string) => {
    if (content == updateDetail) {
      return
    }
    setUpdateDetail(content)
    setIsUserTyping(true)
    detailsUpdateDebounced(content)
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
          '& .MuiInputBase-input.Mui-disabled': {
            WebkitTextFillColor: (theme) => theme.color.gray[600],
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
