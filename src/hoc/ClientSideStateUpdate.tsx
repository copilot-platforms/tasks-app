'use client'

import { setTokenPayload } from '@/redux/features/authDetailsSlice'
import { setAssigneeList, setViewSettings } from '@/redux/features/taskBoardSlice'
import { setTasks, setToken, setWorkflowStates } from '@/redux/features/taskBoardSlice'
import { setTemplates } from '@/redux/features/templateSlice'
import store from '@/redux/store'
import { Token } from '@/types/common'
import { TaskResponse } from '@/types/dto/tasks.dto'
import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'
import { IAssigneeCombined, ITemplate, View } from '@/types/interfaces'
import { ViewMode } from '@prisma/client'
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
}: {
  children: ReactNode
  workflowStates?: WorkflowStateResponse[]
  tasks?: TaskResponse[]
  assignee?: IAssigneeCombined[]
  viewSettings?: CreateViewSettingsDTO
  token?: string
  tokenPayload?: Token
  templates?: ITemplate[]
}) => {
  useEffect(() => {
    if (workflowStates) {
      store.dispatch(setWorkflowStates(workflowStates))
    }

    if (tasks) {
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
    }
    if (tokenPayload) {
      store.dispatch(setTokenPayload(tokenPayload))
    }

    if (templates) {
      store.dispatch(setTemplates(templates))
    }
  }, [workflowStates, tasks, token, assignee, viewSettings, tokenPayload, templates])

  return children
}
