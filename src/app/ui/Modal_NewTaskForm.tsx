'use client'

import { StyledModal } from '@/app/detail/ui/styledComponent'
import {
  clearCreateTaskFields,
  selectCreateTask,
  setActiveWorkflowStateId,
  setShowModal,
} from '@/redux/features/createTaskSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { FilterOptions } from '@/types/interfaces'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { handleCreate } from '../(home)/actions'
import { NewTaskForm } from './NewTaskForm'
import { emptyAssignee } from '@/utils/assignee'

export const ModalNewTaskForm = ({
  handleCreateMultipleAttachments,
}: {
  handleCreateMultipleAttachments: (attachments: CreateAttachmentRequest[]) => Promise<void>
}) => {
  const { token, filterOptions } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, userIds, attachments, dueDate, showModal, templateId } =
    useSelector(selectCreateTask)

  const handleModalClose = async (isKeyboard: boolean = false) => {
    if (isKeyboard && document.querySelector('.tippy-box')) {
      return
    }
    store.dispatch(setShowModal())
    store.dispatch(clearCreateTaskFields({ isFilterOn: !!(filterOptions[FilterOptions.ASSIGNEE] !== emptyAssignee) }))
    store.dispatch(setActiveWorkflowStateId(null))
    // NOTE: Reimplement in M3
    // await bulkRemoveAttachments(attachments)
  }

  return (
    <StyledModal
      open={showModal}
      onClose={() => handleModalClose(true)}
      aria-labelledby="create-task-modal"
      aria-describedby="add-new-task"
      sx={{
        '& > .MuiBackdrop-root': {
          backgroundColor: 'rgba(15,15,15,0.6)',
        },
      }}
    >
      <NewTaskForm
        handleCreate={async () => {
          if (!title.trim()) return

          store.dispatch(setShowModal())
          const formattedDueDate = dueDate && dayjs(new Date(dueDate)).format('YYYY-MM-DD')
          const payload = {
            title,
            body: description,
            workflowStateId,
            ...userIds,
            dueDate: formattedDueDate,
            templateId,
          }

          store.dispatch(clearCreateTaskFields({ isFilterOn: !!(filterOptions[FilterOptions.ASSIGNEE] !== emptyAssignee) }))
          const createdTask = await handleCreate(token as string, CreateTaskRequestSchema.parse(payload))
          const toUploadAttachments: CreateAttachmentRequest[] = attachments.map((el) => {
            return {
              ...el,
              taskId: createdTask.id,
            }
          })
          await handleCreateMultipleAttachments(toUploadAttachments)
        }}
        handleClose={handleModalClose}
      />
    </StyledModal>
  )
}
