import { Task, WorkflowState } from '@prisma/client'

export type TaskWithWorkflowState = Task & { workflowState: WorkflowState }

export type TaskWithPath = Task & { path: string }
