import { withErrorHandler } from '../core/utils/withErrorHandler'
import { getViewSetting, updateViewSetting } from './viewSettings.controller'

export const GET = withErrorHandler(getViewSetting)
export const PATCH = withErrorHandler(updateViewSetting)
