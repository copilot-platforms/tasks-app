/**
 * @deprecated - Deprecated in favor of load-testing-v2 service
    Load testing script for Tasks App
    Add a `LOAD_TESTING_COPILOT_TOKEN` env var with the corresponding workspace's IU token, and let it work its magic.

    Configure counts for clients, companies, tasks, etc using the `load-testing.config.json` JSON file

    Criteria:
      - 5000 clients / companies
      - 2000 tasks
*/

import LoadTester from '@cmd/load-testing/load-testing-v2.service'
import { AssigneeType } from '@prisma/client'

export const run = async () => {
  if (process.env.VERCEL_ENV === 'production') {
    console.error("It's a bad idea to run this in prod")
    process.exit(1)
  }

  const loadTester = new LoadTester()
  // seed companies
  await loadTester.seedCompanies(200)
  // seed clients without a company
  await loadTester.seedClients(200)
  // seed clients with a single company
  await loadTester.seedClients(200, true)
  // seed tasks
  await loadTester.seedTasks(100, AssigneeType.client)
}

run()
