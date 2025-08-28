import { CreateViewSettingsDTO } from '@/types/dto/viewSettings.dto'
import { FilterOptions } from '@/types/interfaces'
import { BaseService } from '@api/core/services/base.service'
import { PoliciesService } from '@api/core/services/policies.service'
import { Resource } from '@api/core/types/api'
import { UserAction } from '@api/core/types/user'
import { ViewMode } from '@prisma/client'
import { z } from 'zod'

export class ViewSettingsService extends BaseService {
  private DEFAULT_VIEW_MODE = ViewMode.board

  async getViewSettingsForUser() {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Read, Resource.ViewSetting)

    const userId = z.string().parse(this.user.internalUserId || this.user.clientId)
    let viewSettings = await this.db.viewSetting.findFirst({
      where: { userId, workspaceId: this.user.workspaceId },
    })
    // If a viewSetting has not been set for this user, create a new one with default viewMode
    // This isn't required but will simplify frontend logic and ensure a view setting always exists for a given IU
    // We can modify default view settings much easier from the backend or using config vars in the future
    if (!viewSettings) {
      viewSettings = await this.createInitialViewSettings(userId)
    }

    return viewSettings
  }

  async createOrUpdateViewSettings(data: CreateViewSettingsDTO) {
    const policyGate = new PoliciesService(this.user)
    policyGate.authorize(UserAction.Create, Resource.ViewSetting)
    const userId = z.string().parse(this.user.internalUserId || this.user.clientId)
    const newViewSettingData = {
      ...data,
      userId,
      workspaceId: this.user.workspaceId,
    }

    // Verify that a view setting exists, or if it doesn't then create a new initial view setting with provided data
    let viewSettings = await this.db.viewSetting.findFirst({
      where: { userId, workspaceId: this.user.workspaceId },
    })
    if (!viewSettings) {
      return await this.createInitialViewSettings(userId)
    }

    return await this.db.viewSetting.update({
      where: { id: viewSettings.id },
      data: newViewSettingData,
    })
  }

  private async createInitialViewSettings(userId: string) {
    return await this.db.viewSetting.create({
      data: {
        userId,
        workspaceId: this.user.workspaceId,
        viewMode: this.DEFAULT_VIEW_MODE,
        filterOptions: {
          [FilterOptions.ASSIGNEE]: {
            internalUserId: null,
            clientId: null,
            companyId: null,
          },
          [FilterOptions.KEYWORD]: '',
          [FilterOptions.TYPE]: '',
        },
        showUnarchived: true,
        showArchived: false,
        showSubtasks: true, // If we DO need to default to false for IUs, we can add a condition here after confirmation
      },
    })
  }
}
