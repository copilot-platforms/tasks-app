import APIError from '@api/core/exceptions/api'
import { BaseService } from '@api/core/services/base.service'
import httpStatus from 'http-status'
import { z } from 'zod'

export class SubtaskService extends BaseService {
  async getSubtaskCounts(id: string): Promise<number> {
    const taskId = z.string().uuid().parse(id)
    const level = (
      await this.db.$queryRaw<{ level: number }[] | null>`
      SELECT nlevel("path") as level FROM "Tasks"
      WHERE id = ${taskId}::uuid AND "workspaceId" = ${this.user.workspaceId}
    `
    )?.[0]?.level
    if (!level) {
      throw new APIError(httpStatus.INTERNAL_SERVER_ERROR, 'Path for task was not set')
    }
    return level
  }

  async addSubtaskCount(id: string, increaseBy?: number, txn?: any) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { increment: increaseBy || 1 } },
    })
  }

  async decreaseSubtaskCount(id: string, decreaseBy?: number) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { decrement: decreaseBy || 1 } },
    })
  }
}
