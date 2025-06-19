import DBClient from '@/lib/db'
import { emptyAssignee } from '@/utils/assignee'

export const normalizeStringAssigneeToObject = async () => {
  const db = DBClient.getInstance()
  const viewSettingsList = await db.viewSetting.findMany()

  if (!viewSettingsList.length) {
    throw new Error('No view settings found')
  }

  const ViewSettingsWhereFilterByAssigneeIsString = viewSettingsList.filter((viewSetting) => {
    return (
      viewSetting?.filterOptions &&
      typeof viewSetting.filterOptions === 'object' &&
      !Array.isArray(viewSetting.filterOptions) &&
      'assignee' in viewSetting.filterOptions &&
      typeof viewSetting.filterOptions.assignee === 'string'
    )
  })

  console.info(`🪛 Number of view setting rows to be updated : ${ViewSettingsWhereFilterByAssigneeIsString.length}`)
  if (!ViewSettingsWhereFilterByAssigneeIsString.length) {
    console.info(`No changes required 🔥`)
    return
  }
  for (const [index, viewSetting] of ViewSettingsWhereFilterByAssigneeIsString.entries()) {
    if (viewSetting) {
      console.info(`updating ${index + 1} / ${ViewSettingsWhereFilterByAssigneeIsString.length} entries ⚒️`)
      await db.viewSetting.update({
        where: { id: viewSetting.id },
        data: {
          ...viewSetting,
          filterOptions: {
            ...(typeof viewSetting.filterOptions === 'object' ? viewSetting.filterOptions : {}),
            assignee: emptyAssignee,
          },
        },
      })
    }
  }
}

normalizeStringAssigneeToObject()
