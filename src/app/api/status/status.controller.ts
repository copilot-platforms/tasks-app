import { NextRequest, NextResponse } from 'next/server'
import AuthService from '@api/core/services/auth.service'
import { StatusService } from './status.service'
import { CreateStatusRequestSchema } from '@/types/dto/status.dto'
import httpStatus from 'http-status'

export const getStatuses = async (req: NextRequest) => {
  const user = await AuthService.authenticate(req)

  const statusService = new StatusService(user)
  const status = await statusService.getAllStatus()

  return NextResponse.json({ status })
}

export const createStatus = async (req: NextRequest) => {
  const user = await AuthService.authenticate(req)

  const data = CreateStatusRequestSchema.parse(await req.json())
  const statusService = new StatusService(user)
  const newStatus = await statusService.createStatus(data)

  return NextResponse.json({ newStatus }, { status: httpStatus.CREATED })
}
