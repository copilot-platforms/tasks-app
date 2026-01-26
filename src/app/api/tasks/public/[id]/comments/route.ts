import { getAllCommentsPublic } from '@/app/api/comment/public/public.controller'
import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'

export const GET = withErrorHandler(getAllCommentsPublic)
