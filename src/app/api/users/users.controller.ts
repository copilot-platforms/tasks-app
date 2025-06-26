import { NextRequest, NextResponse } from 'next/server'
import UsersService from '@api/users/users.service'
import authenticate from '@api/core/utils/authenticate'
import { unstable_noStore as noStore } from 'next/cache'

export const getUsers = async (req: NextRequest) => {
  noStore()
  const user = await authenticate(req)
  const usersService = new UsersService(user)
  const keyword = req.nextUrl.searchParams.get('search')
  const rawLimit = req.nextUrl.searchParams.get('limit')
  const userType = req.nextUrl.searchParams.get('userType') || undefined
  const limit = rawLimit ? +rawLimit : undefined
  const nextToken = req.nextUrl.searchParams.get('nextToken') || undefined

  // "search" param condition has been separated so we can unplug it in the future after CopilotAPI implements keyword match natively
  const users = await (keyword
    ? usersService.getFilteredUsersStartingWith(keyword, userType, limit, nextToken)
    : usersService.getGroupedUsers(limit, undefined))

  return NextResponse.json({ users })
}

export const getUsersForClients = async (req: NextRequest) => {
  noStore()
  const user = await authenticate(req)
  const rawLimit = req.nextUrl.searchParams.get('limit')
  const limit = rawLimit ? +rawLimit : undefined

  const usersService = new UsersService(user)
  const clients = await usersService.getUsersForClients(limit)
  return NextResponse.json({ clients })
}
