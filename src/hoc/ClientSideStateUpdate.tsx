'use client'

import { setTokenPayload, setWorkspace } from '@/redux/features/authDetailsSlice'
import {
  selectTaskBoard,
  setAccesibleTaskIds,
  setAccessibleTasks,
  setActiveTask,
  setAssigneeList,
  setFilteredAssigneeList,
  SetUrlActionParams,
  setPreviewMode,
  setTasks,
  setToken,
  setViewSettings,
  setWorkflowStates,
} from '@/redux/features/taskBoardSlice'
import { setAssigneeSuggestion, setExpandedComments } from '@/redux/features/taskDetailsSlice'
import { setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { UrlActionParamsType, Token, WorkspaceResponse } from '@/types/common'
import { HomeParamActions } from '@/types/constants'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { FilterOptionsKeywords, IAssigneeCombined, IAssigneeSuggestions, ITemplate } from '@/types/interfaces'
import { filterOptionsMap } from '@/types/objectMaps'
import { getPreviewMode, handlePreviewMode } from '@/utils/previewMode'
import { ReactNode, useEffect } from 'react'
import { useSelector } from 'react-redux'

type ClientSideStateUpdateProps = {
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
} & UrlActionParamsType

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
  action,
  pf,
}: ClientSideStateUpdateProps) => {
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

    if (action && action === HomeParamActions.CREATE_TASK) {
      store.dispatch(SetUrlActionParams({ action, pf }))
    }

    if (viewSettings) {
      const viewSettingsCopy = viewSettingsTemp ? structuredClone(viewSettingsTemp) : structuredClone(viewSettings) //deep cloning for immutability and prevent the reducer mutating the original object.
      const previewMode = tokenPayload && !!getPreviewMode(tokenPayload)
      if (previewMode && !viewSettingsCopy.filterOptions.type) {
        viewSettingsCopy.filterOptions.type = FilterOptionsKeywords.CLIENTS
      }
      store.dispatch(setViewSettings(viewSettingsCopy))
      const view = viewSettingsTemp ? viewSettingsTemp.filterOptions : viewSettingsCopy.filterOptions
      store.dispatch(
        setFilteredAssigneeList({
          filteredType:
            filterOptionsMap[view?.type] || (previewMode ? FilterOptionsKeywords.CLIENTS : filterOptionsMap.default),
        }),
      )
    }

    if (tokenPayload) {
      store.dispatch(setTokenPayload(tokenPayload))

      // Handle preview mode feature
      const previewMode = getPreviewMode(tokenPayload)
      store.dispatch(setPreviewMode(previewMode))

      previewMode && handlePreviewMode(tokenPayload)
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
