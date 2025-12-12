import { createSlice } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { AssigneeType } from '@/types/dto/tasks.dto'
import { createTemplateErrors, ITemplate, TargetMethod } from '@/types/interfaces'

interface IErrors {
  [createTemplateErrors.TITLE]: boolean
}

interface IInitialState {
  showTemplateModal: boolean
  taskName: string
  description: string
  workflowStateId: string
  templates?: ITemplate[]
  targetMethod: TargetMethod.EDIT | TargetMethod.POST //the target method for which modal is evoked
  targetTemplateId: string
  errors: IErrors
  activeWorkflowStateId: string | null
  activeTemplate: ITemplate | null
}

const initialState: IInitialState = {
  showTemplateModal: false,
  taskName: '',
  description: '',
  workflowStateId: '',
  templates: undefined,
  targetMethod: TargetMethod.POST,
  targetTemplateId: '',
  errors: {
    [createTemplateErrors.TITLE]: false,
  },
  activeWorkflowStateId: null,
  activeTemplate: null,
}

const createTemplateSlice = createSlice({
  name: 'templateSlice',
  initialState,
  reducers: {
    setShowTemplateModal: (state, action: { payload: { targetMethod?: TargetMethod; targetTemplateId?: string } }) => {
      if (action.payload.targetMethod) {
        state.targetMethod = action.payload.targetMethod
      }
      if (action.payload.targetTemplateId) {
        state.targetTemplateId = action.payload.targetTemplateId
      }
      state.showTemplateModal = !state.showTemplateModal
    },
    setCreateTemplateFields: (state, action: { payload: { targetField: string; value: string | null } }) => {
      const { targetField, value } = action.payload
      //@ts-ignore
      state[targetField] = value
    },

    // Sets the default workflowStateId to be selected when opening template create modal
    setActiveWorkflowStateId: (state, action: { payload: string | null }) => {
      state.activeWorkflowStateId = action.payload
    },

    setTemplates: (state, action: { payload: ITemplate[] | undefined }) => {
      state.templates = action.payload
    },
    clearTemplateFields: (state) => {
      state.workflowStateId = ''
      state.description = ''
      state.taskName = ''
      state.targetTemplateId = ''
      state.errors = {
        [createTemplateErrors.TITLE]: false,
      }
      state.activeWorkflowStateId = null
    },
    setTargetTemplateId: (state, action: { payload: string }) => {
      state.targetTemplateId = action.payload
    },
    setErrors: (state, action: { payload: { key: createTemplateErrors; value: boolean } }) => {
      const { key, value } = action.payload
      state.errors[key] = value
    },
    setActiveTemplate: (state, action: { payload: ITemplate | null }) => {
      state.activeTemplate = action.payload
    },
  },
})

export const selectCreateTemplate = (state: RootState) => state.createTemplate

export const {
  setShowTemplateModal,
  setCreateTemplateFields,
  setTemplates,
  clearTemplateFields,
  setTargetTemplateId,
  setErrors,
  setActiveWorkflowStateId,
  setActiveTemplate,
} = createTemplateSlice.actions

export default createTemplateSlice.reducer
