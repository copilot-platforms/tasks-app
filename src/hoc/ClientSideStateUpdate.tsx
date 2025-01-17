'use client'

import { setTokenPayload, setWorkspace } from '@/redux/features/authDetailsSlice'
import {
  selectTaskBoard,
  setActiveTask,
  setAssigneeList,
  setFilteredAssgineeList,
  setPreviewMode,
  setTasks,
  setToken,
  setViewSettings,
  setWorkflowStates,
} from '@/redux/features/taskBoardSlice'
import { setAssigneeSuggestion } from '@/redux/features/taskDetailsSlice'
import { setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token, WorkspaceResponse } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, IAssigneeSuggestions, ITemplate } from '@/types/interfaces'
import { filterOptionsMap } from '@/types/objectMaps'
import { getPreviewMode, handlePreviewMode } from '@/utils/previewMode'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

/**
 * This HOC is responsible in updating the client side state of the responses that are fetched in the server components.
 * The purpose of this HOC is to avoid prop drilling from server component to client component. Fetched response data from
 * the server component is used in the client component to achieve the functionalities of the task app.
 */
export const ClientSideStateUpdate = ({
  children,
  workflowStates,
  tasks,
  assignee,
  token,
  viewSettings,
  tokenPayload,
  templates,
  assigneeSuggestions,
  task,
  workspace,
}: {
  children: ReactNode
  workflowStates?: WorkflowStateResponse[]
  tasks?: TaskResponse[]
  assignee?: IAssigneeCombined[]
  viewSettings?: CreateViewSettingsDTO
  token?: string
  tokenPayload?: Token | null
  templates?: ITemplate[]
  assigneeSuggestions?: IAssigneeSuggestions[]
  task?: TaskResponse
  workspace?: WorkspaceResponse
}) => {
  const { tasks: tasksInStore, viewSettingsTemp } = useSelector(selectTaskBoard)
  useEffect(() => {
    if (workflowStates) {
      store.dispatch(setWorkflowStates(workflowStates))
    }

    if (tasks && tasksInStore.length === 0) {
      store.dispatch(setTasks(tasks))
    }

    if (token) {
      store.dispatch(setToken(token))
    }

    if (assignee) {
      store.dispatch(setAssigneeList(assignee))
    }

    if (viewSettings) {
      store.dispatch(setViewSettings(viewSettings))
      const view = viewSettingsTemp ? viewSettingsTemp.filterOptions : viewSettings.filterOptions
      store.dispatch(setFilteredAssgineeList({ filteredType: filterOptionsMap[view?.type] || filterOptionsMap.default }))
    }

    if (tokenPayload) {
      store.dispatch(setTokenPayload(tokenPayload))

      // Handle preview mode feature
      const previewMode = getPreviewMode(tokenPayload)
      store.dispatch(setPreviewMode(previewMode))

      previewMode && handlePreviewMode(previewMode, tokenPayload)
    }

    if (templates) {
      store.dispatch(setTemplates(templates))
    }

    if (assigneeSuggestions) {
      store.dispatch(setAssigneeSuggestion(assigneeSuggestions))
    }

    if (task) {
      const updatedTasks = tasksInStore.map((t) => (t.id === task.id ? task : t))
      store.dispatch(setTasks(updatedTasks))
      store.dispatch(setActiveTask(task))
    } //for updating a task in store with respect to task response from db in task details page

    if (workspace) {
      store.dispatch(setWorkspace(workspace))
    }
  }, [workflowStates, tasks, token, assignee, viewSettings, tokenPayload, templates, assigneeSuggestions, task])

  return children
}
