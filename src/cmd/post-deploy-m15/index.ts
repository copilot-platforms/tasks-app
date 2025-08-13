import { backfillCompanyIdInClientNotifications } from '../backfill-company-id-in-client-notifications'
import { normalizeStringAssigneeToObject } from '../normalize-filterOptions-assignee'

const run = async () => {
  console.info('⚒️ Running normalize-filter-options script')
  await normalizeStringAssigneeToObject()
  console.info('🔥 Completed : normalize-filter-options script')
  console.info('⚒️ Running script to backfill companyId in ClientNotifications')
  await backfillCompanyIdInClientNotifications()
  console.info('🔥 Completed : backfill companyId in ClientNotifications')

  //DO NOT FORGET to run trigger deploy action once milestone 15 has been promoted to production
}

run()
