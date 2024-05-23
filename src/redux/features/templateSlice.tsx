import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@/types/dto/tasks.dto'
import { ITemplate, TargetMethod } from '@/types/interfaces'

interface IInitialState {
  showTemplateModal: boolean
  taskName: string
  description: string
  templateName: string
  templates: ITemplate[]
  targetMethod: TargetMethod.EDIT | TargetMethod.POST //the target method for which modal is evoked
  targetTemplateId: string
}

const initialState: IInitialState = {
  showTemplateModal: false,
  taskName: '',
  description: '',
  templateName: '',
  templates: [],
  targetMethod: TargetMethod.POST,
  targetTemplateId: '',
}

const createTemplateSlice = createSlice({
  name: 'templateSlice',
  initialState,
  reducers: {
    setShowTemplateModal: (state, action: { payload: { targetMethod?: TargetMethod; targetTemplateId?: string } }) => {
      state.showTemplateModal = !state.showTemplateModal
      if (action.payload.targetMethod && action.payload.targetTemplateId) {
        state.targetMethod = action.payload.targetMethod
        state.targetTemplateId = action.payload.targetTemplateId
      }
    },
    setCreateTemplateFields: (state, action: { payload: { targetField: string; value: string } }) => {
      const { targetField, value } = action.payload
      //@ts-ignore
      state[targetField] = value
    },
    setTemplates: (state, action: { payload: ITemplate[] }) => {
      state.templates = action.payload
    },
    clearTemplateFields: (state) => {
      state.templateName = ''
      state.description = ''
      state.taskName = ''
      state.targetTemplateId = ''
    },
    setTargetTemplateId: (state, action: { payload: string }) => {
      state.targetTemplateId = action.payload
    },
  },
})

export const selectCreateTemplate = (state: RootState) => state.createTemplate

export const { setShowTemplateModal, setCreateTemplateFields, setTemplates, clearTemplateFields, setTargetTemplateId } =
  createTemplateSlice.actions

export default createTemplateSlice.reducer
