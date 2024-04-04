import { PrismaClient } from '@prisma/client';

class DBClient {
  private static client: PrismaClient;
  private static isInitialized = false;

  private constructor() {
    // private constructor to prevent external instantiation
  }

  private static async disconnectAndExit(): Promise<void> {
    if (DBClient.client) {
      await DBClient.client.$disconnect();
    }
    process.exit();
  }

  static getInstance(): PrismaClient {
    if (!this.client) {
      if (!this.isInitialized) {
        // Make sure that prisma client is only created once
        this.client = new PrismaClient();
        this.isInitialized = true;

        // disconnect the client when the Node.js process exits
        process.on('beforeExit', DBClient.disconnectAndExit);
        process.on('SIGINT', DBClient.disconnectAndExit);
        process.on('SIGTERM', DBClient.disconnectAndExit);
      }
    }

    return this.client;
  }
}

export default DBClient;
