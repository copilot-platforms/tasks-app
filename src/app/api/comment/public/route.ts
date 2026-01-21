import { getAllCommentsPublicForTask } from '@/app/api/comment/public/comment-public.controller'
import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'

export const GET = withErrorHandler(getAllCommentsPublicForTask)
