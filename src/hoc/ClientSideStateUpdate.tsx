'use client'

import { setTokenPayload, setWorkspace } from '@/redux/features/authDetailsSlice'
import {
  selectTaskBoard,
  setAccesibleTaskIds,
  setAccessibleTasks,
  setActiveTask,
  setAssigneeList,
  setFilteredAssigneeList,
  setPreviewMode,
  setTasks,
  setToken,
  setViewSettings,
  setWorkflowStates,
} from '@/redux/features/taskBoardSlice'
import { setAssigneeSuggestion, setExpandedComments } from '@/redux/features/taskDetailsSlice'
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
  clearExpandedComments,
  accesibleTaskIds,
  accessibleTasks,
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
  clearExpandedComments?: boolean
  accesibleTaskIds?: string[]
  accessibleTasks?: TaskResponse[]
  workspace?: WorkspaceResponse
}) => {
  const { tasks: tasksInStore, viewSettingsTemp, accessibleTasks: accessibleTaskInStore } = useSelector(selectTaskBoard)
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
      const viewSettingsCopy = structuredClone(viewSettings) //deep cloning for immutability and prevent the reducer mutating the original object.
      store.dispatch(setViewSettings(viewSettingsCopy))
      const view = viewSettingsTemp ? viewSettingsTemp.filterOptions : viewSettingsCopy.filterOptions
      store.dispatch(setFilteredAssigneeList({ filteredType: filterOptionsMap[view?.type] || filterOptionsMap.default }))
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

    if (clearExpandedComments) {
      store.dispatch(setExpandedComments([]))
    }

    if (task) {
      const updatedTasks = tasksInStore.map((t) => (t.id === task.id ? task : t))
      store.dispatch(setTasks(updatedTasks))
      store.dispatch(setActiveTask(task))
    } else {
      store.dispatch(setActiveTask(undefined)) //when navigated elsewhere from details page, removing the previously set ActiveTask
    } //for updating a task in store with respect to task response from db in task details page

    if (accesibleTaskIds) {
      store.dispatch(setAccesibleTaskIds(accesibleTaskIds))
    }

    if (accessibleTasks) {
      const accessibleTaskData = accessibleTaskInStore.length ? accessibleTaskInStore : accessibleTasks
      store.dispatch(setAccessibleTasks(accessibleTaskData))
    }

    if (workspace) {
      store.dispatch(setWorkspace(workspace))
    }

    return () => {
      store.dispatch(setActiveTask(undefined))
    } //when component is unmounted, we need to clear the active task.
  }, [
    workflowStates,
    tasks,
    token,
    assignee,
    viewSettings,
    tokenPayload,
    templates,
    assigneeSuggestions,
    task,
    accesibleTaskIds,
    accessibleTasks,
  ])

  return children
}
