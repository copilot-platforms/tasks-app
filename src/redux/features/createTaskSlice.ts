import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@prisma/client'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { DateString } from '@/types/date'
import { CreateTaskErrors } from '@/types/interfaces'

interface IErrors {
  [CreateTaskErrors.TITLE]: boolean
  [CreateTaskErrors.ASSIGNEE]: boolean
}

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assigneeType?: AssigneeType | null
  assigneeId: string | null
  attachments: CreateAttachmentRequest[]
  dueDate: DateString | null
  errors: IErrors
}

const initialState: IInitialState = {
  showModal: false,
  title: '',
  workflowStateId: '',
  description: '',
  assigneeType: null,
  assigneeId: null,
  attachments: [],
  dueDate: null,
  errors: {
    [CreateTaskErrors.TITLE]: false,
    [CreateTaskErrors.ASSIGNEE]: false,
  },
}

const createTaskSlice = createSlice({
  name: 'createTask',
  initialState,
  reducers: {
    setShowModal: (state) => {
      state.showModal = !state.showModal
    },

    removeOneAttachment: (state, action: { payload: { attachment: CreateAttachmentRequest } }) => {
      const { attachment } = action.payload
      state.attachments = state.attachments.filter((el) => el.filePath !== attachment.filePath)
    },

    setCreateTaskFields: (
      state,
      action: { payload: { targetField: string; value: string | null | CreateAttachmentRequest[] } },
    ) => {
      const { targetField, value } = action.payload
      //@ts-ignore
      state[targetField] = value
    },

    clearCreateTaskFields: (state, action: { payload: { isFilterOn: boolean } }) => {
      const { isFilterOn } = action.payload
      state.title = ''
      state.workflowStateId = ''
      state.description = ''
      if (!isFilterOn) {
        state.assigneeType = null
        state.assigneeId = null
      }
      state.attachments = []
      state.dueDate = null
      state.errors = {
        [CreateTaskErrors.TITLE]: false,
        [CreateTaskErrors.ASSIGNEE]: false,
      }
    },

    setErrors: (state, action: { payload: { key: CreateTaskErrors; value: boolean } }) => {
      const { key, value } = action.payload
      state.errors[key] = value
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields, clearCreateTaskFields, removeOneAttachment, setErrors } =
  createTaskSlice.actions

export default createTaskSlice.reducer
