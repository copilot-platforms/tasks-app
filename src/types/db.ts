import { Task, WorkflowState } from '@prisma/client'

/**
 * Task entity with its associated workflow state.
 */
export type TaskWithWorkflowState = Task & {
  readonly workflowState: WorkflowState
}
