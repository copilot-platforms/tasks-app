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
  activeWorkflowStateId: string | null
  title: string
  description: string
  workflowStateId: string
  assigneeType?: AssigneeType | null
  assigneeId: string | null
  attachments: CreateAttachmentRequest[]
  dueDate: DateString | null
  errors: IErrors
  appliedTitle: string | null
  appliedDescription: string | null
  templateId: string | null
}

const initialState: IInitialState = {
  showModal: false,
  activeWorkflowStateId: null,
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
  appliedTitle: null,
  appliedDescription: null,
  templateId: null,
}

const createTaskSlice = createSlice({
  name: 'createTask',
  initialState,
  reducers: {
    setShowModal: (state) => {
      state.showModal = !state.showModal
    },

    // Sets the default workflowStateId to be selected when opening task create modal
    setActiveWorkflowStateId: (state, action: { payload: string | null }) => {
      state.activeWorkflowStateId = action.payload
    },

    removeOneAttachment: (state, action: { payload: { attachment: CreateAttachmentRequest } }) => {
      const { attachment } = action.payload
      state.attachments = state.attachments.filter((el) => el.filePath !== attachment.filePath)
    },

    setCreateTaskFields: (
      state,
      action: { payload: { targetField: keyof IInitialState; value: IInitialState[keyof IInitialState] } },
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
      state.templateId = null
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
      state.appliedDescription = null
      state.appliedTitle = null
    },

    setErrors: (state, action: { payload: { key: CreateTaskErrors; value: boolean } }) => {
      const { key, value } = action.payload
      state.errors[key] = value
    },

    setAppliedTitle: (state, action: { payload: { title: string | null } }) => {
      const { title } = action.payload
      state.appliedTitle = title
    },
    setAppliedDescription: (state, action: { payload: { description: string | null } }) => {
      const { description } = action.payload
      state.appliedDescription = description
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const {
  setShowModal,
  setActiveWorkflowStateId,
  setCreateTaskFields,
  clearCreateTaskFields,
  removeOneAttachment,
  setErrors,
  setAppliedDescription,
  setAppliedTitle,
} = createTaskSlice.actions

export default createTaskSlice.reducer
