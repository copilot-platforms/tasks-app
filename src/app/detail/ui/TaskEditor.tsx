'use client'

import { StyledTextField } from '@/components/inputs/TextField'
import { selectTaskDetails, setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import { Box, Modal } from '@mui/material'
import { useEffect, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import store from '@/redux/store'
import { upload } from '@vercel/blob/client'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { ISignedUrlUpload, UserType } from '@/types/interfaces'
import { Tapwrite } from 'tapwrite'
import { useDebounce, useDebounceWithCancel } from '@/hooks/useDebounce'
import { useRouter } from 'next/navigation'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { SupabaseActions } from '@/utils/SupabaseActions'
import { generateRandomString } from '@/utils/generateRandomString'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { ScrapImageRequest } from '@/types/common'

import { deleteEditorAttachmentsHandler, uploadImageHandler } from '@/utils/inlineImage'

interface Prop {
  task_id: string
  task: TaskResponse
  // attachment: AttachmentResponseSchema[]
  isEditable: boolean
  updateTaskDetail: (detail: string) => void
  updateTaskTitle: (title: string) => void
  deleteTask: () => void
  postAttachment: (postAttachmentPayload: CreateAttachmentRequest) => void
  deleteAttachment: (id: string) => void
  userType: UserType
}

export const TaskEditor = ({
  task_id,
  task,
  // attachment,
  isEditable,
  updateTaskDetail,
  updateTaskTitle,
  deleteTask,
  postAttachment,
  deleteAttachment,
  userType,
}: Prop) => {
  const [updateTitle, setUpdateTitle] = useState('')
  const [updateDetail, setUpdateDetail] = useState('')
  const { showConfirmDeleteModal } = useSelector(selectTaskDetails)
  const { tasks, token } = useSelector(selectTaskBoard)
  const [isUserTyping, setIsUserTyping] = useState(false)

  // const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   event.preventDefault()
  //   const files = event.target.files
  //   if (files && files.length > 0) {
  //     const file = files[0]
  //     const supabaseActions = new SupabaseActions()
  //     const signedUrl: ISignedUrlUpload = await getSignedUrlUpload(generateRandomString(file.name))
  //     const filePayload = await supabaseActions.uploadAttachment(file, signedUrl, task_id)
  //     if (filePayload) {
  //       postAttachment({ ...filePayload, taskId: filePayload.taskId })
  //     }
  //   }
  // }

  useEffect(() => {
    if (!isUserTyping) {
      const currentTask = tasks.find((el) => el.id === task_id)
      if (currentTask) {
        setUpdateTitle(currentTask.title || '')

        setUpdateDetail(currentTask.body ?? '')
      }
    }
  }, [tasks, task_id, isUserTyping])

  const _titleUpdateDebounced = async (title: string) => updateTaskTitle(title)

  const [titleUpdateDebounced, cancelTitleUpdateDebounced] = useDebounceWithCancel(_titleUpdateDebounced)

  const _detailsUpdateDebounced = async (details: string) => updateTaskDetail(details)
  const detailsUpdateDebounced = useDebounce(_detailsUpdateDebounced)

  const resetTypingFlag = useCallback(() => {
    setIsUserTyping(false)
  }, [])

  const [debouncedResetTypingFlag, cancelDebouncedResetTypingFlag] = useDebounceWithCancel(resetTypingFlag, 1500)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setUpdateTitle(newTitle)
    if (newTitle.trim() == '') {
      cancelTitleUpdateDebounced()
      cancelDebouncedResetTypingFlag()
      return
    }
    setIsUserTyping(true)
    titleUpdateDebounced(newTitle)
    debouncedResetTypingFlag()
  }

  const handleTitleBlur = () => {
    if (updateTitle.trim() == '') {
      setTimeout(() => {
        const currentTask = tasks.find((el) => el.id === task_id)
        setUpdateTitle(currentTask?.title ?? '')
      }, 300)
    }
  }

  const handleDetailChange = (content: string) => {
    if (content === updateDetail) {
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
        onBlur={handleTitleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault() //prevent users from breaking line
          }
        }}
      />

      <Box mt="12px" sx={{ height: '100%', width: '100%' }}>
        <Tapwrite
          content={updateDetail}
          getContent={handleDetailChange}
          readonly={userType === UserType.CLIENT_USER}
          editorClass="tapwrite-details-page"
          placeholder="Add description..."
          uploadFn={(file) => uploadImageHandler(file, token ?? '', task_id)}
          deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', task_id)}
        />
      </Box>

      {/* {advancedFeatureFlag && ( */}
      {/* <> */}
      {/*     <Stack direction="row" columnGap={3} rowGap={3} mt={3} flexWrap={'wrap'}> */}
      {/*       {attachment?.map((el, key) => { */}
      {/*         return ( */}
      {/*           <Box key={key}> */}
      {/*             <AttachmentCard */}
      {/*               file={el} */}
      {/*               deleteAttachment={async (event: any) => { */}
      {/*                 event.stopPropagation() */}
      {/*                 const supabaseActions = new SupabaseActions() */}
      {/*                 const { data } = await supabaseActions.removeAttachment(el.filePath) */}
      {/*                 if (data && el.id) { */}
      {/*                   deleteAttachment(el.id) */}
      {/*                 } */}
      {/*               }} */}
      {/*             /> */}
      {/*           </Box> */}
      {/*         ) */}
      {/*       })} */}
      {/*     </Stack> */}

      {/*     <Stack direction="row" mt={3} justifyContent="flex-end"> */}
      {/*       <AttachmentInput handleFileSelect={handleFileSelect} /> */}
      {/*     </Stack> */}
      {/*   </> */}
      {/* )} */}

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
