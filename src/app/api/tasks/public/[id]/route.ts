import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { deleteOneTaskPublic, getOneTaskPublic } from '@api/tasks/public/public.controller'

export const GET = withErrorHandler(getOneTaskPublic)
export const DELETE = withErrorHandler(deleteOneTaskPublic)
