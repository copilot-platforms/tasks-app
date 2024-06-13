import { NextRequest, NextResponse } from 'next/server'
import authenticate from '@api/core/utils/authenticate'
import { CommentService } from '@api/comment/comment.service'
import { CreateCommentSchema, UpdateCommentSchema } from '@/types/dto/comment.dto'
import httpStatus from 'http-status'
import { IdParams } from '@api/core/types/api'

export const createComment = async (req: NextRequest) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)

  const data = CreateCommentSchema.parse(await req.json())

  const comment = await commentService.create(data)

  return NextResponse.json({ comment }, { status: httpStatus.CREATED })
}

export const deleteComment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)

  const commentService = new CommentService(user)

  await commentService.delete(id)

  return new Response(null, { status: httpStatus.NO_CONTENT })
}

export const updateComment = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const data = UpdateCommentSchema.parse(await req.json())

  const commentService = new CommentService(user)

  const updatedComment = await commentService.update(id, data)

  return NextResponse.json({ comment: updatedComment }, { status: httpStatus.OK })
}
