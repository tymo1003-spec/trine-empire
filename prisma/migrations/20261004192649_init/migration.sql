/*
  Warnings:

  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "event";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Block" (
    "timestamp" BIGINT NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "prevHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Block_index_idx" ON "Block"("index");

-- CreateIndex
CREATE INDEX "Block_hash_idx" ON "Block"("hash");

-- CreateIndex
CREATE INDEX "Block_prevHash_idx" ON "Block"("prevHash");
