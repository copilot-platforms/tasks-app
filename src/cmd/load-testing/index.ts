import config from '@cmd/load-testing/load-testing.config.json'
import LoadTester from '@cmd/load-testing/load-testing.service'

/**
    Load testing script for Tasks App
    Add a `LOAD_TESTING_COPILOT_TOKEN` env var with the corresponding workspace's IU token, and let it work its magic.

    Configure counts for clients, companies, tasks, etc using the `load-testing.config.json` JSON file

    Criteria:
      - 5000 clients / companies
      - 2000 tasks
*/
export const run = async () => {
  const loadTester = new LoadTester()
  const individualClients = await loadTester.seedClients(config.individualClients)
  const { companies, clients: companyClients } = await loadTester.seedCompanyClients(config.companies, config.companyClients)

  await loadTester.seedClientTasks(individualClients, config.countsToAssign.individualClients)
  await loadTester.seedCompanyTasks(companies, config.countsToAssign.companies)
  await loadTester.seedClientTasks(companyClients, config.countsToAssign.companyClients)
}

run()
