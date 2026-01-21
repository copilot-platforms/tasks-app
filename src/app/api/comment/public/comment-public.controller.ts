import { CommentService } from '@/app/api/comment/comment.service'
import authenticate from '@/app/api/core/utils/authenticate'
import { defaultLimit } from '@/constants/public-api'
import { getSearchParams } from '@/utils/request'
import { NextRequest, NextResponse } from 'next/server'
import { decode, encode } from 'js-base64'
import { PublicCommentSerializer } from '@/app/api/comment/public/comment-public.serializer'
import { CommentsPublicFilterType } from '@/types/dto/comment.dto'
import { IdParams } from '@/app/api/core/types/api'
import { getPaginationLimit } from '@/utils/pagination'

type TaskAndCommentIdParams = {
  params: Promise<{ id: string; commentId: string }>
}

export const getAllCommentsPublic = async (req: NextRequest, { params }: IdParams) => {
  const { id: taskId } = await params
  const user = await authenticate(req)

  const { parentCommentId, createdBy, limit, nextToken } = getSearchParams(req.nextUrl.searchParams, [
    'parentCommentId',
    'createdBy',
    'limit',
    'nextToken',
  ])

  const publicFilters: CommentsPublicFilterType = {
    taskId,
    parentId: parentCommentId || undefined,
    initiatorId: createdBy || undefined,
  }

  const commentService = new CommentService(user)
  await commentService.checkCommentTaskPermissionForUser(taskId) // check the user accessing the comment has access to the task

  const comments = await commentService.getAllComments({
    limit: getPaginationLimit(limit),
    lastIdCursor: nextToken ? decode(nextToken) : undefined,
    ...publicFilters,
  })

  const lastCommentId = comments[comments.length - 1]?.id
  const hasMoreComments = lastCommentId
    ? await commentService.hasMoreCommentsAfterCursor(lastCommentId, publicFilters)
    : false
  const base64NextToken = hasMoreComments ? encode(lastCommentId) : undefined

  return NextResponse.json({
    data: await PublicCommentSerializer.serializeMany(comments),
    nextToken: base64NextToken,
  })
}

export const getOneCommentPublic = async (req: NextRequest, { params }: TaskAndCommentIdParams) => {
  const { id: taskId, commentId } = await params
  const user = await authenticate(req)

  const commentService = new CommentService(user)
  await commentService.checkCommentTaskPermissionForUser(taskId) // check the user accessing the comment has access to the task

  const comment = await commentService.getCommentById({ id: commentId, includeAttachments: true })
  if (!comment) return NextResponse.json({ data: null })

  return NextResponse.json({ data: await PublicCommentSerializer.serialize(comment) })
}

export const deleteOneCommentPublic = async (req: NextRequest, { params }: TaskAndCommentIdParams) => {
  const { id: taskId, commentId } = await params
  const user = await authenticate(req)

  const commentService = new CommentService(user)
  await commentService.checkCommentTaskPermissionForUser(taskId) // check the user accessing the comment has access to the task

  const deletedComment = await commentService.delete(commentId)
  return NextResponse.json({ ...(await PublicCommentSerializer.serialize(deletedComment)) })
}
