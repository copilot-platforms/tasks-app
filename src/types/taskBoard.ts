import { UserRole } from '@/app/api/core/types/user'
import { ReactNode } from 'react'

export interface TaskWorkflowStateProps {
  mode: UserRole
  workflowStateId: string
  columnName: string
  taskCount: string
  children: ReactNode
}
