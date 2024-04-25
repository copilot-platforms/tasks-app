import { withErrorHandler } from '@api/core/utils/withErrorHandler'
import { getViewSetting, updateViewSetting } from '@api/view-settings/viewSettings.controller'

export const GET = withErrorHandler(getViewSetting)
export const PATCH = withErrorHandler(updateViewSetting)
