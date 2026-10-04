-- CreateTable
CREATE TABLE "event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockNumber" INTEGER NOT NULL,
    "txHash" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "confirmations" INTEGER NOT NULL,
    "previousHash" TEXT NOT NULL,
    "validatorId" TEXT NOT NULL,
    "gasFee" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "event_txHash_key" ON "event"("txHash");
