import DBClient from '@/lib/db'
import { emptyAssignee } from '@/utils/assignee'
import Bottleneck from 'bottleneck'

export const normalizeStringAssigneeToObject = async () => {
  const db = DBClient.getInstance()
  const dbBottleneck = new Bottleneck({ minTime: 100, maxConcurrent: 5 })

  const viewSettingsList = await db.viewSetting.findMany()

  if (!viewSettingsList.length) {
    throw new Error('No view settings found')
  }

  const ViewSettingsWhereFilterByAssigneeIsString = viewSettingsList.filter((viewSetting) => {
    return (
      viewSetting?.filterOptions &&
      typeof viewSetting.filterOptions === 'object' &&
      'assignee' in viewSetting.filterOptions &&
      typeof viewSetting.filterOptions.assignee === 'string'
    )
  })

  console.info(`🪛 Number of view setting rows to be updated : ${ViewSettingsWhereFilterByAssigneeIsString.length}`)
  if (!ViewSettingsWhereFilterByAssigneeIsString.length) {
    console.info(`No changes required 🔥`)
    return
  }
  const updatePromises = []
  for (const [index, viewSetting] of ViewSettingsWhereFilterByAssigneeIsString.entries()) {
    if (viewSetting) {
      console.info(`queuing update ${index + 1} / ${ViewSettingsWhereFilterByAssigneeIsString.length} ⚒️`)
      const updatePromise = dbBottleneck.schedule(() =>
        db.viewSetting.update({
          where: { id: viewSetting.id },
          data: {
            ...viewSetting,
            filterOptions: {
              ...(typeof viewSetting.filterOptions === 'object' ? viewSetting.filterOptions : {}),
              assignee: emptyAssignee,
            },
          },
        }),
      )
      updatePromises.push(updatePromise)
    }
  }

  await Promise.all(updatePromises)
}

normalizeStringAssigneeToObject()
