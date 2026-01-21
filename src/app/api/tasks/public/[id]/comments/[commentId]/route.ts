import { deleteOneCommentPublic, getOneCommentPublic } from '@/app/api/comment/public/comment-public.controller'
import { withErrorHandler } from '@/app/api/core/utils/withErrorHandler'

export const GET = withErrorHandler(getOneCommentPublic)
export const DELETE = withErrorHandler(deleteOneCommentPublic)
