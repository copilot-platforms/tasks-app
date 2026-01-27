import { CreateCommentSchema, UpdateCommentSchema } from '@/types/dto/comment.dto'
import { getSearchParams } from '@/utils/request'
import { signMediaForComments } from '@/utils/signedUrlReplacer'
import { CommentService } from '@/app/api/comments/comment.service'
import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import httpStatus from 'http-status'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const createComment = async (req: NextRequest) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)
  const data = CreateCommentSchema.parse(await req.json())
  const comment = await commentService.create(data)
  return NextResponse.json({ comment }, { status: httpStatus.CREATED })
}

export const deleteComment = async (req: NextRequest, { params }: IdParams) => {
  const { id } = await params
  const user = await authenticate(req)

  const commentService = new CommentService(user)
  await commentService.delete(id)
  //Can't use status code 204 in NextResponse as of now - https://github.com/vercel/next.js/discussions/51475
  //Using Response is also not allowed since withErrorHandler wrapper uses NextResponse.
  return NextResponse.json({ message: 'Comment deleted!' })
}

export const updateComment = async (req: NextRequest, { params }: IdParams) => {
  const { id } = await params
  const user = await authenticate(req)

  const data = UpdateCommentSchema.parse(await req.json())
  const commentService = new CommentService(user)
  const comment = await commentService.update(id, data)

  return NextResponse.json({ comment })
}

export const getFilteredComments = async (req: NextRequest) => {
  const user = await authenticate(req)

  const { parentId: rawParentId } = getSearchParams(req.nextUrl.searchParams, ['parentId'])
  const parentId = z.string().uuid().parse(rawParentId)
  const commentService = new CommentService(user)
  const comments = await commentService.getComments({ parentId })
  const signedComments = await signMediaForComments(comments)

  return NextResponse.json({
    comments: await commentService.addInitiatorDetails(signedComments),
  })
}
