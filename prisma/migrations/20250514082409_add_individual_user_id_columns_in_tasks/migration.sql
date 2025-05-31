-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "clientId" UUID,
ADD COLUMN     "companyId" UUID,
ADD COLUMN     "internalUserId" UUID;
