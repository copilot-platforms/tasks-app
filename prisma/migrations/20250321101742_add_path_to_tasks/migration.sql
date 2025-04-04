-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "path" ltree;

-- CreateIndex
CREATE INDEX "Tasks_path_idx" ON "Tasks" USING GIST ("path");
