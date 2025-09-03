'use client'

import { StyledModal } from '@/app/detail/ui/styledComponent'
import {
  clearCreateTaskFields,
  selectCreateTask,
  setActiveWorkflowStateId,
  setShowModal,
} from '@/redux/features/createTaskSlice'
import { selectTaskBoard, SetUrlActionParams } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { FilterOptions } from '@/types/interfaces'
import dayjs from 'dayjs'
import { useSelector } from 'react-redux'
import { handleCreate } from '../(home)/actions'
import { NewTaskForm } from './NewTaskForm'
import { checkEmptyAssignee } from '@/utils/assignee'
import { useEffect } from 'react'
import { HomeParamActions } from '@/types/constants'

export const ModalNewTaskForm = ({
  handleCreateMultipleAttachments,
}: {
  handleCreateMultipleAttachments: (attachments: CreateAttachmentRequest[]) => Promise<void>
}) => {
  const { token, filterOptions, urlActionParams } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, userIds, attachments, dueDate, showModal, templateId, parentId } =
    useSelector(selectCreateTask)

  const handleModalClose = async (isKeyboard: boolean = false) => {
    if (isKeyboard && document.querySelector('.tippy-box')) {
      return
    }
    store.dispatch(setShowModal())
    store.dispatch(clearCreateTaskFields({ isFilterOn: !checkEmptyAssignee(filterOptions[FilterOptions.ASSIGNEE]) }))
    store.dispatch(setActiveWorkflowStateId(null))
    store.dispatch(SetUrlActionParams({ oldPf: urlActionParams.pf }))
    // NOTE: Reimplement in M3
    // await bulkRemoveAttachments(attachments)
  }

  useEffect(() => {
    if (
      Object.keys(urlActionParams).length > 0 &&
      urlActionParams.action === HomeParamActions.CREATE_TASK &&
      urlActionParams.pf !== urlActionParams.oldPf
    ) {
      store.dispatch(setShowModal())
    }
  }, [urlActionParams])

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
            parentId,
          }

          store.dispatch(clearCreateTaskFields({ isFilterOn: !checkEmptyAssignee(filterOptions[FilterOptions.ASSIGNEE]) }))
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
