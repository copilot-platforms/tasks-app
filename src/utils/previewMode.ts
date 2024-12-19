import { setCreateTaskFields } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { PreviewMode, Token } from '@/types/common'

export const handlePreviewMode = (previewMode: NonNullable<PreviewMode>, tokenPayload: Token) => {
  // If clientId is provided, ignore corresponding companyId. Else pick up the companyId
  const previewId = tokenPayload.clientId || tokenPayload.companyId
  if (!previewId) {
    throw new Error('Could not find preview client / company id')
  }

  store.dispatch(setCreateTaskFields({ targetField: 'assigneeId', value: previewId }))
  store.dispatch(setCreateTaskFields({ targetField: 'assigneeType', value: previewMode }))
}
