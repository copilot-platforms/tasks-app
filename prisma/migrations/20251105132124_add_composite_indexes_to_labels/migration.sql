-- CreateIndex
CREATE INDEX "IX_Labels_labelledEntity_createdAt" ON "Labels"("labelledEntity", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "IX_Labels_label_createdAt" ON "Labels"("label", "createdAt" DESC);
