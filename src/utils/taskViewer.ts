import { Token } from '@/types/common'
import { Viewers } from '@/types/dto/tasks.dto'
import { getPreviewMode } from './previewMode'

export const checkIfTaskViewer = (viewers: Viewers, tokenPayload: Token | undefined): boolean => {
  return (
    Array.isArray(viewers) &&
    viewers.length > 0 &&
    (!viewers[0].clientId || viewers[0].clientId === tokenPayload?.clientId) &&
    viewers[0].companyId === tokenPayload?.companyId &&
    !getPreviewMode(tokenPayload)
  )
}
