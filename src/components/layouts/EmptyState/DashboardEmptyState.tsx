'use client'

import { handleCreate } from '@/app/actions'
import { NewTaskForm } from '@/app/ui/NewTaskForm'
import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AddIcon, TasksListIcon } from '@/icons'
import { clearCreateTaskFields, selectCreateTask, setShowModal } from '@/redux/features/createTaskSlice'
import { appendTask, selectTaskBoard } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { CreateTaskRequestSchema } from '@/types/dto/tasks.dto'
import { ISignedUrlUpload, UserType } from '@/types/interfaces'
import { bulkRemoveAttachments } from '@/utils/bulkRemoveAttachments'
import { SxCenter } from '@/utils/mui'
import { Box, Modal, Stack, Typography } from '@mui/material'
import { useSelector } from 'react-redux'

const DashboardEmptyState = ({
  getSignedUrlUpload,
  handleCreateMultipleAttachments,
  userType,
}: {
  getSignedUrlUpload?: (fileName: string) => Promise<ISignedUrlUpload>
  handleCreateMultipleAttachments?: (attachments: CreateAttachmentRequest[]) => Promise<void>
  userType: UserType
}) => {
  const { token } = useSelector(selectTaskBoard)
  const { title, description, workflowStateId, assigneeId, assigneeType, attachments, dueDate, showModal } =
    useSelector(selectCreateTask)

  return (
    <>
      <AppMargin size={SizeofAppMargin.LARGE} py="20px">
        <Box
          sx={{
            display: 'flex',
            height: '80vh',
            ...SxCenter,
          }}
        >
          <Stack rowGap={'20px'} direction={'column'} sx={{ width: '453px' }}>
            <Stack rowGap={'12px'} direction={'column'}>
              <Box
                sx={{
                  padding: '6px',
                  background: (theme) => theme.color.gray[150],
                  width: '40px',
                  borderRadius: '6px',
                  gap: '20px',
                  height: '40px',
                }}
              >
                <TasksListIcon />
              </Box>

              <Typography variant="2xl" lineHeight={'32px'}>
                {userType == UserType.INTERNAL_USER ? " You don't have any tasks yet" : 'No tasks assigned'}
              </Typography>
              <Typography variant="bodyLg" sx={{ color: (theme) => theme.color.gray[500] }}>
                {userType == UserType.INTERNAL_USER
                  ? 'Tasks will be shown here after they’re created. You can create a new task below.'
                  : 'Tasks will show here once they’ve been assigned to you. '}
              </Typography>
            </Stack>
            {userType == UserType.INTERNAL_USER && (
              <Box>
                <PrimaryBtn
                  startIcon={<AddIcon />}
                  buttonText="New Task"
                  handleClick={() => {
                    store.dispatch(setShowModal())
                  }}
                />
              </Box>
            )}
          </Stack>
        </Box>
      </AppMargin>

      {getSignedUrlUpload && handleCreateMultipleAttachments && (
        <Modal
          open={showModal}
          onClose={async () => {
            store.dispatch(setShowModal())
            store.dispatch(clearCreateTaskFields())
            await bulkRemoveAttachments(attachments)
          }}
          aria-labelledby="create-task-modal"
          aria-describedby="add-new-task"
        >
          <NewTaskForm
            handleCreate={async () => {
              if (title) {
                store.dispatch(setShowModal())
                store.dispatch(clearCreateTaskFields())
                const createdTask = await handleCreate(
                  token as string,
                  CreateTaskRequestSchema.parse({
                    title,
                    body: description,
                    workflowStateId,
                    assigneeType,
                    assigneeId,
                    dueDate,
                  }),
                )
                store.dispatch(appendTask(createdTask))
                const toUploadAttachments: CreateAttachmentRequest[] = attachments.map((el) => {
                  return {
                    ...el,
                    taskId: createdTask.id,
                  }
                })
                store.dispatch(clearCreateTaskFields())
                await handleCreateMultipleAttachments(toUploadAttachments)
              }
            }}
            getSignedUrlUpload={getSignedUrlUpload}
          />
        </Modal>
      )}
    </>
  )
}

export default DashboardEmptyState
