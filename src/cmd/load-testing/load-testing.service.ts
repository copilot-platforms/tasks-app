import DBClient from '@/lib/db'
import {
  ClientRequest,
  ClientRequestSchema,
  ClientResponse,
  CompanyCreateRequest,
  CompanyCreateRequestSchema,
} from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import Bottleneck from 'bottleneck'
import { z } from 'zod'

interface Taskable {
  id: string
}

type TaskableAssigneeType = 'client' | 'company'

class LoadTester {
  protected db: PrismaClient = DBClient.getInstance()
  private token = z.string().parse(process.env.LOAD_TESTING_COPILOT_TOKEN)
  private copilot: CopilotAPI = new CopilotAPI(this.token)

  // API bottleneck specific to seeding Copilot API
  // Ref: https://www.npmjs.com/package/bottleneck
  private bottleneck = new Bottleneck({
    minTime: 150,
    maxConcurrent: 2,
  })

  async seedClients(numOfClients: number, companyId?: string): Promise<ClientResponse[]> {
    if (companyId && z.string().uuid().safeParse(companyId).error) {
      console.error('LoadTester#seedClients :: Invalid companyId', companyId)
    }
    const seedPromises = []
    for (let i = 0; i < numOfClients; i++) {
      const givenName = faker.person.firstName()
      const familyName = faker.person.lastName()
      const email = 'loadtest_' + faker.internet.email().toLowerCase()
      const client: ClientRequest = ClientRequestSchema.parse({ givenName, familyName, email, companyId })
      const seedPromiseWithBottleneck = this.bottleneck.schedule(() => {
        console.info(`Seeding client ${givenName} ${familyName}`, companyId ? `for companyId ${companyId}` : '(individual)')
        return this.copilot.createClient(client)
      })
      seedPromises.push(seedPromiseWithBottleneck)
    }
    return await Promise.all(seedPromises)
  }

  async seedCompanyClients(numOfCompanies: number, numOfClients: number) {
    const seedPromises = []
    for (let i = 0; i < numOfCompanies; i++) {
      const name = faker.company.name() + ' Loadtest'
      const company: CompanyCreateRequest = CompanyCreateRequestSchema.parse({ name })
      const seedPromiseWithBottleneck = this.bottleneck.schedule(() => {
        console.info(`Seeding company ${name}`)
        return this.copilot.createCompany(company)
      })
      seedPromises.push(seedPromiseWithBottleneck)
    }
    const clients: ClientResponse[] = []

    const companies = await Promise.all(seedPromises)
    for (let company of companies) {
      const companyClients = await this.seedClients(numOfClients, company.id)
      clients.push(...companyClients)
    }

    return { companies, clients }
  }

  async seedTasks(user: Taskable, userType: TaskableAssigneeType, taskPerUser: number) {}
}

export default LoadTester
