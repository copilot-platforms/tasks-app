import { withErrorHandler } from '../core/utils/withErrorHandler'
import { getViewSetting } from './viewSettings.controller'

export const GET = withErrorHandler(getViewSetting)
