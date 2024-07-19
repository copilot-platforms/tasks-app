import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@prisma/client'
import { CreateAttachmentRequest } from '@/types/dto/attachments.dto'
import { DateString } from '@/types/date'

interface IInitialState {
  showModal: boolean
  title: string
  description: string
  workflowStateId: string
  assigneeType?: AssigneeType | null
  assigneeId: string | null
  attachments: CreateAttachmentRequest[]
  dueDate: DateString | null
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

    clearCreateTaskFields: (state) => {
      state.title = ''
      state.workflowStateId = ''
      state.description = ''
      state.assigneeType = null
      state.assigneeId = null
      state.attachments = []
      state.dueDate = null
    },
  },
})

export const selectCreateTask = (state: RootState) => state.createTask

export const { setShowModal, setCreateTaskFields, clearCreateTaskFields, removeOneAttachment } = createTaskSlice.actions

export default createTaskSlice.reducer
