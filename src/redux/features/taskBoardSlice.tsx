import { RootState } from '@/redux/store'
import { PreviewMode } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO, FilterOptionsType } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import {
  FilterByOptions,
  FilterOptions,
  IAssigneeCombined,
  IFilterOptions,
  ISelectorAssignee,
  UserIds,
} from '@/types/interfaces'
import { emptyAssignee, UserIdsType } from '@/utils/assignee'
import { ViewMode } from '@prisma/client'
import { createSlice } from '@reduxjs/toolkit'

interface IInitialState {
  workflowStates: WorkflowStateResponse[]
  assignee: IAssigneeCombined[]
  tasks: TaskResponse[]
  token: string | undefined
  view: ViewMode
  filteredTasks: TaskResponse[]
  filterOptions: IFilterOptions
  filteredAssigneeList: IAssigneeCombined[]
  showArchived: boolean | undefined
  showUnarchived: boolean | undefined
  viewSettingsTemp: CreateViewSettingsDTO | undefined
  isTasksLoading: boolean
  activeTask: TaskResponse | undefined
  previewMode: PreviewMode
  accesibleTaskIds: string[]
  accessibleTasks: TaskResponse[]
  confirmAssignModalId: string | undefined
  assigneeCache: Record<string, IAssigneeCombined>
}

const initialState: IInitialState = {
  workflowStates: [],
  tasks: [],
  token: undefined,
  assignee: [],
  view: ViewMode.board,
  filteredTasks: [], //contains tasks which are client-side filtered. is modified from the useFilter custom hook.
  filterOptions: {
    [FilterOptions.ASSIGNEE]: emptyAssignee,
    [FilterOptions.KEYWORD]: '',
    [FilterOptions.TYPE]: '',
  },
  filteredAssigneeList: [],
  showArchived: undefined,
  showUnarchived: undefined,
  viewSettingsTemp: undefined,
  // Use this state as a global loading flag for tasks
  isTasksLoading: true,
  activeTask: undefined,
  previewMode: null,
  accesibleTaskIds: [],
  accessibleTasks: [],
  confirmAssignModalId: '',
  assigneeCache: {},
}

const taskBoardSlice = createSlice({
  name: 'taskBoard',
  initialState,
  reducers: {
    setWorkflowStates: (state, action: { payload: WorkflowStateResponse[] }) => {
      state.workflowStates = action.payload
    },
    setActiveTask: (state, action: { payload: TaskResponse | undefined }) => {
      state.activeTask = action.payload
    },
    setTasks: (state, action: { payload: TaskResponse[] }) => {
      state.tasks = action.payload
    },
    appendTask: (state, action: { payload: TaskResponse }) => {
      state.tasks = [...state.tasks, action.payload]
    },
    setFilteredTasks: (state, action: { payload: TaskResponse[] }) => {
      state.filteredTasks = action.payload
    },
    setToken: (state, action: { payload: string }) => {
      state.token = action.payload
    },
    updateWorkflowStateIdByTaskId: (state, action) => {
      let taskToUpdate = state.tasks.find((task) => task.id === action.payload.taskId)
      if (taskToUpdate) {
        taskToUpdate.workflowStateId = action.payload.targetWorkflowStateId
        const updatedTasks = [...state.tasks.filter((task) => task.id !== action.payload.taskId), taskToUpdate]
        state.tasks = updatedTasks
        state.filteredTasks = state.filteredTasks.map((filteredTask) => {
          const updatedTask = updatedTasks.find((task) => task.id === filteredTask.id)
          return updatedTask || filteredTask
        })
      }
    },
    setAssigneeList: (state, action: { payload: IAssigneeCombined[] }) => {
      state.assignee = action.payload
      state.filteredAssigneeList = action.payload
    },
    setViewSettings: (state, action: { payload: CreateViewSettingsDTO }) => {
      const { viewMode, filterOptions, showArchived, showUnarchived } = action.payload
      state.view = viewMode
      state.showArchived = showArchived
      state.showUnarchived = showUnarchived
      taskBoardSlice.caseReducers.updateFilterOption(state, { payload: { filterOptions } })
    },
    setViewSettingsTemp: (state, action: { payload: CreateViewSettingsDTO }) => {
      state.viewSettingsTemp = action.payload
    },
    setFilterOptions: (state, action: { payload: { optionType: FilterOptions; newValue: string | null | UserIdsType } }) => {
      state.filterOptions = {
        ...state.filterOptions,
        [action.payload.optionType]: action.payload.newValue,
      }
    },
    setFilteredAssigneeList: (state, action: { payload: { filteredType: FilterByOptions } }) => {
      const filteredType = action.payload.filteredType
      if (filteredType == 'internalUsers') {
        state.filteredAssigneeList = state.assignee.filter((el) => el.type == FilterByOptions.IUS)
      }
      if (filteredType == 'clients') {
        state.filteredAssigneeList = state.assignee.filter(
          (el) => el.type == FilterByOptions.CLIENT || el.type == FilterByOptions.COMPANY,
        )
      }
      if (filteredType == FilterByOptions.NOFILTER) {
        state.filteredAssigneeList = state.assignee
      }
    },
    updateFilterOption: (state, action: { payload: { filterOptions: FilterOptionsType } }) => {
      const { filterOptions } = action.payload
      let updatedFilterOptions = { ...filterOptions }
      if (filterOptions?.assignee) {
        const assigneeCheck = state.assignee.find(
          (assignee) =>
            assignee.id === filterOptions.assignee[UserIds.INTERNAL_USER_ID] ||
            assignee.id === filterOptions.assignee[UserIds.CLIENT_ID] ||
            assignee.id === filterOptions.assignee[UserIds.COMPANY_ID],
        )
        if (!assigneeCheck) {
          updatedFilterOptions = {
            ...updatedFilterOptions,
            assignee: emptyAssignee,
          }
        }
      }
      state.filterOptions = updatedFilterOptions
    }, //updates filters according to viewSettings

    setIsTasksLoading: (state, action: { payload: boolean }) => {
      state.isTasksLoading = action.payload
    },

    setPreviewMode: (state, action: { payload: PreviewMode }) => {
      state.previewMode = action.payload
    },
    /**
     * @deprecated - Use `accessibleTasks` state instead
     */
    setAccesibleTaskIds: (state, action: { payload: string[] }) => {
      state.accesibleTaskIds = action.payload
    },
    setAccessibleTasks: (state, action: { payload: TaskResponse[] }) => {
      state.accessibleTasks = action.payload
    },
    setConfirmAssigneeModalId: (state, action: { payload: string | undefined }) => {
      state.confirmAssignModalId = action.payload
    },
    setAssigneeCache: (state, action: { payload: { key: string; value: IAssigneeCombined } }) => {
      state.assigneeCache[action.payload.key] = action.payload.value
    }, //used in memory cache rather than useMemo for cross-view(board and list) caching. The alternate idea would be to include assignee object in the response of getTasks api for each task but that would be a bit expensive.
  },
})

export const selectTaskBoard = (state: RootState) => state.taskBoard

export const {
  setWorkflowStates,
  setTasks,
  appendTask,
  updateWorkflowStateIdByTaskId,
  setToken,
  setAssigneeList,
  setFilteredTasks,
  setViewSettings,
  setFilterOptions,
  setFilteredAssigneeList,
  setViewSettingsTemp,
  setIsTasksLoading,
  setActiveTask,
  setPreviewMode,
  setAccesibleTaskIds,
  setAccessibleTasks,
  setConfirmAssigneeModalId,
  setAssigneeCache,
} = taskBoardSlice.actions

export default taskBoardSlice.reducer
