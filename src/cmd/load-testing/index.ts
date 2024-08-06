import config from '@cmd/load-testing/load-testing.config.json'
import LoadTester, { Taskable, TaskableAssigneeType } from '@cmd/load-testing/load-testing.service'
import { AssigneeType } from '@prisma/client'

/**
    Load testing script for Tasks App
    Add a `LOAD_TESTING_COPILOT_TOKEN` env var with the corresponding workspace's IU token, and let it work its magic.

    Configure counts for clients, companies, tasks, etc using the `load-testing.config.json` JSON file
*/
export const run = async () => {
  // Criteria:
  // - 5000 clients / companies
  // - 2000 tasks
  const loadTester = new LoadTester()
  const individualClients = await loadTester.seedClients(config.clients.individual)
  const { companies, clients: companyClients } = await loadTester.seedCompanyClients(
    config.companies,
    config.clients.company,
  )

  await loadTester.seedClientTasks(individualClients, config.tasks)
  await loadTester.seedCompanyTasks(companies, config.tasks)
  await loadTester.seedClientTasks(companyClients, config.tasks)
}

run()
