'use client'

import { setTokenPayload } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard, setAssigneeList, setFilteredAssgineeList, setViewSettings } from '@/redux/features/taskBoardSlice'
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
      if (view && view.type in filterOptionsMap) {
        store.dispatch(setFilteredAssgineeList({ filteredType: filterOptionsMap[view.type] }))
      } else {
        store.dispatch(setFilteredAssgineeList({ filteredType: FilterByOptions.NOFILTER }))
      }
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
  }, [workflowStates, tasks, token, assignee, viewSettings, tokenPayload, templates, assigneeSuggestions])

  return children
}
