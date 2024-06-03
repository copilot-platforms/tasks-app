import { NextRequest, NextResponse } from 'next/server'
import authenticate from '../core/utils/authenticate'
import { CommentService } from './comment.service'
import { CreateCommentSchema, UpdateCommentSchema } from '@/types/dto/comment.dto'
import httpStatus from 'http-status'
import { IdParams } from '../core/types/api'

export const createComment = async (req: NextRequest) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)

  const data = CreateCommentSchema.parse(await req.json())

  const comment = await commentService.createComment(data)

  return NextResponse.json({ comment }, { status: httpStatus.CREATED })
}

export const getComments = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)

  const logs = await commentService.getComments(id)

  return NextResponse.json({ logs }, { status: httpStatus.OK })
}

export const deleteComment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)

  await commentService.deleteComment(id)

  return NextResponse.json({ message: 'Comment deleted!' }, { status: httpStatus.OK })
}

export const updateComment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const data = UpdateCommentSchema.parse(await req.json())

  const commentService = new CommentService(user)

  const updatedComment = await commentService.updateComment(id, data)

  return NextResponse.json({ comment: updatedComment }, { status: httpStatus.OK })
}
