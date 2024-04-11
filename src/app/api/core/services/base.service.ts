import DBClient from '@/lib/db'
import { PrismaClient } from '@prisma/client'

export class BaseService {
  protected db: PrismaClient = DBClient.getInstance()
}
