-- CreateTable
CREATE TABLE "ScrapImages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filePath" TEXT NOT NULL,
    "taskId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ScrapImages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScrapImages_filePath_key" ON "ScrapImages"("filePath");

-- AddForeignKey
ALTER TABLE "ScrapImages" ADD CONSTRAINT "ScrapImages_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
