import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { createWorkflowStates, getWorkflowStates } from '@api/workflow-states/workflowStates.controller'

export const GET = withErrorHandler(getWorkflowStates)
export const POST = withErrorHandler(createWorkflowStates)
