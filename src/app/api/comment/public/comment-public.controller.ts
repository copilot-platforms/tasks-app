import { CommentService } from '@/app/api/comment/comment.service'
import authenticate from '@/app/api/core/utils/authenticate'
import { defaultLimit } from '@/constants/public-api'
import { getSearchParams } from '@/utils/request'
import { NextRequest, NextResponse } from 'next/server'
import { decode, encode } from 'js-base64'
import { PublicCommentSerializer } from '@/app/api/comment/public/comment-public.serializer'
import APIError from '@/app/api/core/exceptions/api'
import httpStatus from 'http-status'
import { CommentsPublicFilterType } from '@/types/dto/comment.dto'

export const getAllCommentsPublic = async (req: NextRequest) => {
  const user = await authenticate(req)

  const { parentCommentId, taskId, createdBy, limit, nextToken } = getSearchParams(req.nextUrl.searchParams, [
    'parentCommentId',
    'taskId',
    'createdBy',
    'limit',
    'nextToken',
  ])

  if (!taskId) throw new APIError(httpStatus.BAD_REQUEST, 'taskId is required')

  const publicFilters: CommentsPublicFilterType = {
    taskId,
    parentId: (parentCommentId === 'null' ? null : parentCommentId) || undefined,
    initiatorId: createdBy || undefined,
  }

  const commentService = new CommentService(user)
  const comments = await commentService.getAllComments({
    limit: limit ? +limit : defaultLimit,
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
