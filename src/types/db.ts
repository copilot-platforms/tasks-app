import { Task, WorkflowState } from '@prisma/client'

export type TaskWithWorkflowState = Task & { workflowState: WorkflowState }
