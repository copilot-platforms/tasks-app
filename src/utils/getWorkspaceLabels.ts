import { WorkspaceResponse } from '@/types/common'

type WorkspaceLabels = {
  individualTerm: string
  individualTermPlural: string
  groupTerm: string
  groupTermPlural: string
}

export const getWorkspaceLabels = (workspace?: WorkspaceResponse, shouldCapitalize?: boolean): WorkspaceLabels => {
  const capitalize = (str?: string): string => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '')
  const deCapitalize = (str?: string): string => (str ? str.charAt(0).toLowerCase() + str.slice(1) : '')
  const labels = shouldCapitalize
    ? {
        individualTerm: workspace?.labels?.individualTerm ? capitalize(workspace.labels.individualTerm) : 'Client',
        individualTermPlural: workspace?.labels?.individualTermPlural
          ? capitalize(workspace.labels.individualTermPlural)
          : 'Clients',
        groupTerm: workspace?.labels?.groupTerm ? capitalize(workspace.labels.groupTerm) : 'Company',
        groupTermPlural: workspace?.labels?.groupTermPlural ? capitalize(workspace.labels.groupTermPlural) : 'Companies',
      }
    : {
        individualTerm: workspace?.labels?.individualTerm ? deCapitalize(workspace.labels.individualTerm) : 'client',
        individualTermPlural: workspace?.labels?.individualTermPlural
          ? deCapitalize(workspace.labels.individualTermPlural)
          : 'clients',
        groupTerm: workspace?.labels?.groupTerm ? deCapitalize(workspace.labels.groupTerm) : 'company',
        groupTermPlural: workspace?.labels?.groupTermPlural ? deCapitalize(workspace.labels.groupTermPlural) : 'companies',
      }

  return labels
}
