import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { ViewMode } from '@prisma/client'

export class ViewSettingsService extends BaseService {
  private DEFAULT_VIEW_MODE = ViewMode.board

  async getViewSettingsForUser() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.ViewSetting)

    let viewSettings = await this.db.viewSetting.findFirst({
      where: { userId: this.user.internalUserId, workspaceId: this.user.workspaceId },
    })

    // If a viewSetting has not been set for this user, create a new one with default viewMode
    if (!viewSettings) {
      viewSettings = await this.db.viewSetting.create({
        data: {
          userId: this.user.internalUserId as string,
          workspaceId: this.user.workspaceId,
          viewMode: this.DEFAULT_VIEW_MODE,
        },
      })
    }

    return viewSettings
  }
}
