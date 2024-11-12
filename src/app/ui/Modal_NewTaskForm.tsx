'use client'

import {
  clearCreateTaskFields,
  selectCreateTask,
  setShowModal,
  setActiveWorkflowStateId,
} from '@/redux/features/createTaskSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { bulkRemoveAttachments } from '@/utils/bulkRemoveAttachments'
import { Modal } from '@mui/material'
import { useSelector } from 'react-redux'
import { handleCreate } from '../actions'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { NewTaskForm } from './NewTaskForm'
import { FilterOptions, ISignedUrlUpload } from '@/types/interfaces'
import dayjs from 'dayjs'

export const ModalNewTaskForm = ({
  getSignedUrlUpload,
  handleCreateMultipleAttachments,
}: {
  getSignedUrlUpload: (fileName: string) => Promise<ISignedUrlUpload>
  handleCreateMultipleAttachments: (attachments: CreateAttachmentRequest[]) => Promise<void>
}) => {
  const { token, filterOptions } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, assigneeId, assigneeType, attachments, dueDate, showModal } =
    useSelector(selectCreateTask)

  const handleModalClose = async ({ triggeredFrom }: { triggeredFrom: 'MOUSE' | 'KEYBOARD' }) => {
    const hasSlashCommandMenu = document.querySelector('.tippy-box') !== null
    if (!(triggeredFrom === 'KEYBOARD' && hasSlashCommandMenu)) {
      store.dispatch(setShowModal())
      store.dispatch(clearCreateTaskFields({ isFilterOn: !!filterOptions[FilterOptions.ASSIGNEE] }))
      store.dispatch(setActiveWorkflowStateId(null))
    }
    // NOTE: Reimplement in M3
    // await bulkRemoveAttachments(attachments)
  }

  return (
    <Modal
      open={showModal}
      onClose={() => handleModalClose({ triggeredFrom: 'KEYBOARD' })}
      aria-labelledby="create-task-modal"
      aria-describedby="add-new-task"
    >
      <NewTaskForm
        handleCreate={async () => {
          if (title && assigneeId && assigneeType) {
            store.dispatch(setShowModal())
            const formattedDueDate = dueDate && dayjs(new Date(dueDate)).format('YYYY-MM-DD')

            const payload = {
              title,
              body: description,
              workflowStateId,
              assigneeType,
              assigneeId,
              dueDate: formattedDueDate,
            }

            store.dispatch(clearCreateTaskFields({ isFilterOn: !!filterOptions[FilterOptions.ASSIGNEE] }))
            const createdTask = await handleCreate(token as string, CreateTaskRequestSchema.parse(payload))
            const toUploadAttachments: CreateAttachmentRequest[] = attachments.map((el) => {
              return {
                ...el,
                taskId: createdTask.id,
              }
            })
            await handleCreateMultipleAttachments(toUploadAttachments)
          }
        }}
        handleClose={() => handleModalClose({ triggeredFrom: 'MOUSE' })}
        getSignedUrlUpload={getSignedUrlUpload}
      />
    </Modal>
  )
}
