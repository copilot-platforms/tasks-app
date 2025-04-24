import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteOneTaskPublic, getOneTaskPublic, updateTaskPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getOneTaskPublic)
export const PATCH = withErrorHandler(updateTaskPublic)
export const DELETE = withErrorHandler(deleteOneTaskPublic)
