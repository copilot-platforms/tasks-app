import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
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
    // This isn't required but will simplify frontend logic and ensure a view setting always exists
    // We can modify default view settings much easier from the backend or using config vars
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

  async createOrUpdateViewSettings(data: CreateViewSettingsDTO) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.ViewSetting)

    const newViewSettingData = {
      ...data,
      userId: this.user.internalUserId as string,
      workspaceId: this.user.workspaceId,
    }

    // Verify that a view setting exists, or if it doesn't - create a new view setting with provided data
    let viewSettings = await this.db.viewSetting.findFirst({
      where: { userId: this.user.internalUserId, workspaceId: this.user.workspaceId },
    })

    if (!viewSettings) {
      viewSettings = await this.db.viewSetting.create({ data: newViewSettingData })
    }

    return await this.db.viewSetting.update({
      where: { id: viewSettings.id },
      data: newViewSettingData,
    })
  }
}
