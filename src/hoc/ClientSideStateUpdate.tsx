'use client'

import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { setTokenPayload } from '@/redux/features/authDetailsSlice'
import {
  selectTaskBoard,
  setAssigneeList,
  setFilteredAssgineeList,
  setGlobalTasksRepo,
  setViewSettings,
} from '@/redux/features/taskBoardSlice'
import { setTasks, setToken, setWorkflowStates } from '@/redux/features/taskBoardSlice'
import { setAssigneeSuggestion } from '@/redux/features/taskDetailsSlice'
import { setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import {
  FilterByOptions,
  FilterOptionsKeywords,
  IAssigneeSuggestions,
  IAssigneeCombined,
  ITemplate,
} from '@/types/interfaces'
import { filterOptionsMap } from '@/types/objectMaps'
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
}) => {
  const { tasks: tasksInStore, viewSettingsTemp, globalTasksRepo: globalTasksInStore } = useSelector(selectTaskBoard)
  useEffect(() => {
    if (workflowStates) {
      store.dispatch(setWorkflowStates(workflowStates))
    }

    if (tasks && tasksInStore.length === 0) {
      store.dispatch(setGlobalTasksRepo(tasks))
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
    }

    if (templates) {
      store.dispatch(setTemplates(templates))
    }

    if (assigneeSuggestions) {
      store.dispatch(setAssigneeSuggestion(assigneeSuggestions))
    }

    if (task) {
      console.log('ClientSideStateUpdate task', task)
      const updatedTasks = tasksInStore.map((t) => (t.id === task.id ? task : t))
      const updatedGlobalTasks = globalTasksInStore.map((t) => (t.id === task.id ? task : t))
      store.dispatch(setGlobalTasksRepo(updatedGlobalTasks))
      store.dispatch(setTasks(updatedTasks))
    } //for updating a task in store with respect to task response from db in task details page
  }, [workflowStates, tasks, token, assignee, viewSettings, tokenPayload, templates, assigneeSuggestions, task])

  return children
}
