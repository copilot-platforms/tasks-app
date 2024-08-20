'use client'

import { setTokenPayload } from '@/redux/features/authDetailsSlice'
import { setAssigneeList, setFilteredAssgineeList, setViewSettings } from '@/redux/features/taskBoardSlice'
import { setTasks, setToken, setWorkflowStates } from '@/redux/features/taskBoardSlice'
import { setAssigneeSuggestion, setTask } from '@/redux/features/taskDetailsSlice'
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
import { ReactNode, useEffect } from 'react'

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
  children?: ReactNode
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
  useEffect(() => {
    if (workflowStates) {
      store.dispatch(setWorkflowStates(workflowStates))
    }

    if (tasks?.length) {
      store.dispatch(setTasks(tasks))
    }

    if (token) {
      store.dispatch(setToken(token))
    }

    if (assignee?.length) {
      store.dispatch(setAssigneeList(assignee))
    }

    if (viewSettings) {
      store.dispatch(setViewSettings(viewSettings))
      viewSettings.filterOptions?.type == FilterOptionsKeywords.CLIENTS
        ? store.dispatch(setFilteredAssgineeList({ filteredType: FilterByOptions.CLIENT }))
        : viewSettings.filterOptions?.type == FilterOptionsKeywords.TEAM
          ? store.dispatch(setFilteredAssgineeList({ filteredType: FilterByOptions.IUS }))
          : viewSettings.filterOptions?.type == ''
            ? store.dispatch(setFilteredAssgineeList({ filteredType: FilterByOptions.NOFILTER }))
            : store.dispatch(setFilteredAssgineeList({ filteredType: FilterByOptions.NOFILTER }))
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
      store.dispatch(setTask(task))
    }
  }, [workflowStates, tasks, token, assignee, viewSettings, tokenPayload, templates, assigneeSuggestions])

  return children
}
