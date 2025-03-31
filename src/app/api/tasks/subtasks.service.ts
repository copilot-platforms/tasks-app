import { buildLtreeNodeString } from '@/utils/ltree'
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

  async addSubtaskCount(id: string, increment: number = 1) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { increment } },
    })
  }

  async decreaseSubtaskCount(id: string, decrement: number = 1) {
    await this.db.task.update({
      where: { id, workspaceId: this.user.workspaceId },
      data: { subtaskCount: { decrement } },
    })
  }

  /**
   * Soft-deletes all tasks where children have path derived from parent task's
   * @param id Parent Task id
   */
  async softDeleteAllSubtasks(id: string) {
    console.info('SubtasksService#deleteAllSubtasks | Deleting all subtasks for parent with id', id)

    const taskLabels = (
      await this.db.$queryRawUnsafe<Array<{ label: string }>>(
        `
      SELECT "label"
      FROM "Tasks"
      WHERE "deletedAt" IS NULL
        AND "workspaceId" = $1
        AND path @ '${buildLtreeNodeString(id)}'`,
        // Without injecting ltree path like this, Prisma throws an error....
        // even though the rendered SQL works fine when executed in a query console
        this.user.workspaceId,
      )
    ).map((row) => row.label)

    await this.db.task.deleteMany({ where: { label: { in: taskLabels } } })
    await this.db.label.deleteMany({ where: { label: { in: taskLabels } } })
  }
}
