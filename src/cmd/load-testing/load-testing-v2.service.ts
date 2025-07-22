import DBClient from '@/lib/db'
import {
  ClientRequest,
  ClientRequestSchema,
  CompanyCreateRequest,
  CompanyCreateRequestSchema,
  InternalUsersResponse,
} from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { AssigneeType, PrismaClient } from '@prisma/client'
import Bottleneck from 'bottleneck'
import { z } from 'zod'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'
import { MAX_FETCH_ASSIGNEE_COUNT } from '@/constants/users'

class LoadTester {
  protected db: PrismaClient = DBClient.getInstance()

  private token = z.string().parse(process.env.LOAD_TESTING_COPILOT_TOKEN)
  private apiKey = z.string().parse(process.env.COPILOT_API_KEY)
  private copilot: CopilotAPI = new CopilotAPI(this.token, this.apiKey)
  private bottlenecks = {
    copilot: new Bottleneck({ minTime: 150, maxConcurrent: 2 }),
    db: new Bottleneck({ minTime: 100, maxConcurrent: 5 }),
  }

  async seedCompanies(numOfCompanies: number) {
    const seedPromises = []

    for (let i = 0; i < numOfCompanies; i++) {
      const name = faker.company.name() + 'LoadTest'
      const iconImageUrl = faker.image.avatar()
      const isPlaceholder = false

      const company: CompanyCreateRequest = CompanyCreateRequestSchema.parse({ name, iconImageUrl, isPlaceholder })
      const seedPromiseWithBottleneck = this.bottlenecks.copilot.schedule(() => {
        console.info(`Seeding company ${name}`)
        return this.copilot.createCompany(company)
      })
      seedPromises.push(seedPromiseWithBottleneck)
    }
    const responses = await Promise.all(seedPromises)
    this.exportToCSV(responses, AssigneeType.company)
    return responses
  }

  async seedClients(numOfClients: number, includeCompany: boolean = false) {
    const seedPromises = []
    let companiesList = null
    if (includeCompany) {
      companiesList = (await this.copilot.getCompanies({ limit: MAX_FETCH_ASSIGNEE_COUNT })).data?.filter(
        (data) => !data.isPlaceholder,
      )
    }

    for (let i = 0; i < numOfClients; i++) {
      const givenName = faker.person.firstName()
      const familyName = faker.person.lastName() + ' Client'
      const email = faker.internet.email({ firstName: givenName, lastName: familyName })
      let companyId = undefined
      if (includeCompany && companiesList) {
        companyId = companiesList[Math.floor(Math.random() * companiesList.length)].id
      }
      const client: ClientRequest = ClientRequestSchema.parse({ givenName, familyName, email, companyId })
      const seedPromiseWithBottleneck = this.bottlenecks.copilot.schedule(() => {
        console.info(`Seeding client ${givenName} ${familyName}`)
        return this.copilot.createClient(client)
      })
      seedPromises.push(seedPromiseWithBottleneck)
    }
    const responses = await Promise.all(seedPromises)
    this.exportToCSV(responses, AssigneeType.client)
    return responses
  }

  private exportToCSV(data: Record<string, any>[], type: AssigneeType) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      })
      csvRows.push(values.join(','))
    }

    const csvContent = csvRows.join('\n')
    const outputPath = path.resolve(process.cwd(), `seeded_${type}_${Date.now()}.csv`)

    fs.writeFileSync(outputPath, csvContent)
    console.log(`✅ CSV written to ${outputPath}`)
  }
}

export default LoadTester
