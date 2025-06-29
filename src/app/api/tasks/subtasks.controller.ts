import { IdParams } from '@api/core/types/api'
import authenticate from '@api/core/utils/authenticate'
import { SubtaskService } from '@api/tasks/subtasks.service'
import { NextRequest, NextResponse } from 'next/server'

export const getSubtaskCount = async (req: NextRequest, { params: { id } }: IdParams) => {
  const user = await authenticate(req)
  const subtaskService = new SubtaskService({ user })
  const count = await subtaskService.getSubtaskCounts(id)
  return NextResponse.json({ count, canCreateSubtask: count < 2 })
}
