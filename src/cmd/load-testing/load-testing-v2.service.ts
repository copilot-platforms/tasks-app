import DBClient from '@/lib/db'
import { CompanyCreateRequest, CompanyCreateRequestSchema, InternalUsersResponse } from '@/types/common'
import { CopilotAPI } from '@/utils/CopilotAPI'
import { PrismaClient } from '@prisma/client'
import Bottleneck from 'bottleneck'
import { z } from 'zod'
import { faker } from '@faker-js/faker'
import fs from 'fs'
import path from 'path'

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
    this.exportToCSV(responses)
    return responses
  }

  private exportToCSV(data: Record<string, any>[]) {
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
    const outputPath = path.resolve(process.cwd(), 'seeded_companies.csv')

    fs.writeFileSync(outputPath, csvContent)
    console.log(`✅ CSV written to ${outputPath}`)
  }
}

export default LoadTester
