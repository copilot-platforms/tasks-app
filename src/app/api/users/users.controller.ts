import { NextRequest, NextResponse } from 'next/server'
import UsersService from './users.service'
import AuthService from '../core/services/auth.service'

export const getUsers = async (req: NextRequest) => {
  const user = await AuthService.authenticate(req)

  const usersService = new UsersService(user)
  const users = await usersService.getGroupedUsers()

  return NextResponse.json({ users })
}
