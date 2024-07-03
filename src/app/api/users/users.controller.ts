import { NextRequest, NextResponse } from 'next/server'
import UsersService from '@api/users/users.service'
import authenticate from '@api/core/utils/authenticate'
import { unstable_noStore as noStore } from 'next/cache'

export const getUsers = async (req: NextRequest) => {
  noStore()
  const user = await authenticate(req)
  const usersService = new UsersService(user)
  const users = await usersService.getGroupedUsers()

  return NextResponse.json({ users })
}

export const getClients = async (req: NextRequest) => {
  noStore()
  const user = await authenticate(req)

  const usersService = new UsersService(user)
  const clients = await usersService.getClient()
  return NextResponse.json({ clients })
}
