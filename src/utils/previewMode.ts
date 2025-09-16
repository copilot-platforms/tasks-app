import { setFilterOptions } from '@/redux/features/taskBoardSlice'
import store from '@/redux/store'
import { PreviewMode, Token } from '@/types/common'
import { FilterOptions } from '@/types/interfaces'

export const getPreviewMode = (tokenPayload: Token): PreviewMode => {
  const isClientPreview = tokenPayload.internalUserId && tokenPayload.clientId
  // For a company to be alongside IU token, it shouldn't be "default" or undefined
  // Older workspaces in Copilot have "default" as companyId, while newer ones have undefined for IUs
  const isDefaultCompany = tokenPayload.companyId === 'default'
  const isCompanyPreview = tokenPayload.internalUserId && !isDefaultCompany && !!tokenPayload.companyId
  const previewMode: PreviewMode = isClientPreview ? 'client' : isCompanyPreview ? 'company' : null
  return previewMode
}

export const handlePreviewMode = (previewMode: NonNullable<PreviewMode>, tokenPayload: Token) => {
  // If clientId is provided, ignore corresponding companyId. Else pick up the companyId
  const previewClientId = tokenPayload.clientId
  const previewCompanyId = tokenPayload.companyId
  if (!previewClientId && !previewCompanyId) {
    throw new Error('Could not find preview client / company id')
  }
}
