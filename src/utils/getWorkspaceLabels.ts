import { WorkspaceResponse } from '@/types/common'

export const getWorkspaceLabels = (workspace: WorkspaceResponse, shouldCapitalize?: boolean) => {
  const capitalize = (str?: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str)
  const labels = shouldCapitalize
    ? {
        individualTerm: workspace?.label?.individualTerm ? capitalize(workspace.label.individualTerm) : 'Client',
        individualTermPlural: workspace?.label?.individualTermPlural
          ? capitalize(workspace.label.individualTermPlural)
          : 'Clients',
        groupTerm: workspace?.label?.groupTerm ? capitalize(workspace.label.groupTerm) : 'Company',
        groupTermPlural: workspace?.label?.groupTermPlural ? capitalize(workspace.label.groupTermPlural) : 'Companies',
      }
    : {
        individualTerm: workspace?.label?.individualTerm ? workspace.label.individualTerm : 'client',
        individualTermPlural: workspace?.label?.individualTermPlural ? workspace.label.individualTermPlural : 'clients',
        groupTerm: workspace?.label?.groupTerm ? workspace.label.groupTerm : 'company',
        groupTermPlural: workspace?.label?.groupTermPlural ? workspace.label.groupTermPlural : 'companies',
      }

  return labels
}
