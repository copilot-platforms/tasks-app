import { Prisma } from '@prisma/client'

/**
 * Prisma extension for soft delete
 */
export const softDelete = Prisma.defineExtension({
  name: 'softDelete',
  model: {
    $allModels: {
      async delete<M, A>(this: M, args: Prisma.Args<M, 'delete'>['where']): Promise<Prisma.Result<M, A, 'update'>> {
        const context = Prisma.getExtensionContext(this)
        return (context as any).update({
          where: { ...args.where },
          data: {
            deletedAt: new Date(),
          },
        })
      },
    },
  },
})

/**
 * Prisma extension for bulk soft delete
 */
export const softDeleteMany = Prisma.defineExtension({
  name: 'softDeleteMany',
  model: {
    $allModels: {
      async deleteMany<M, A>(
        this: M,
        args: Prisma.Args<M, 'deleteMany'>['where'],
      ): Promise<Prisma.Result<M, A, 'updateMany'>> {
        const context = Prisma.getExtensionContext(this)

        return (context as any).updateMany({
          where: { ...args.where },
          data: {
            deletedAt: new Date(),
          },
        })
      },
    },
  },
})

/**
 * Prisma extension for filtering out soft deleted values from all relevant operations
 */
export const filterSoftDeleted = Prisma.defineExtension({
  name: 'filterSoftDeleted',
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (operation === 'findUnique' || operation === 'findFirst' || operation === 'findMany') {
          args.where = { deletedAt: null, ...args.where }
          return query(args)
        }
        return query(args)
      },
    },
  },
})
