import { PrismaClient } from '@prisma/client'
import { filterSoftDeleted, softDelete, softDeleteMany } from '@/lib/prismaExtensions'
import { isProd, showQueries } from '@/config'

class DBClient {
  private static client: PrismaClient
  private static isInitialized = false

  private constructor() {
    // private constructor to prevent external instantiation
  }

  private static async disconnectAndExit(): Promise<void> {
    if (DBClient.client) {
      await DBClient.client.$disconnect()
    }
    process.exit()
  }

  static getInstance(): PrismaClient {
    if (!this.client) {
      if (!this.isInitialized) {
        // Make sure that prisma client is only created once
        // @ts-expect-error $use is deprecated but it is expected
        this.client = new PrismaClient({
          log: showQueries ? ['query'] : undefined,
        })
          .$extends(softDelete)
          .$extends(softDeleteMany)
          .$extends(filterSoftDeleted)
        this.isInitialized = true

        // disconnect the client when the Node.js process exits
        process.on('beforeExit', DBClient.disconnectAndExit)
        process.on('SIGINT', DBClient.disconnectAndExit)
        process.on('SIGTERM', DBClient.disconnectAndExit)
      }
    }

    return this.client
  }
}

export default DBClient
