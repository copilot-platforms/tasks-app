import DBClient from '@/lib/db'
import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const db: PrismaClient = DBClient.getInstance()
export const GET = (req: NextRequest) => {}
