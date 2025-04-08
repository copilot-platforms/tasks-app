import { AssigneeType, Task, WorkflowState } from '@prisma/client'

export type TaskWithWorkflowState = Task & { workflowState: WorkflowState }

export type AncestorTask = Pick<Task, 'title' | 'label'> & { assigneeId: string; assigneeType: AssigneeType }
