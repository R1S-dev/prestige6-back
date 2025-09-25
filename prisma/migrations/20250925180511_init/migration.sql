-- CreateTable
CREATE TABLE "Setting" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "jackpotCode" TEXT NOT NULL,
    "jpGrowPerSec" REAL NOT NULL,
    "jpStartMini" INTEGER NOT NULL,
    "jpStartMain" INTEGER NOT NULL,
    "plannedMoneyBag" INTEGER,
    "plannedX2a" INTEGER,
    "plannedX2b" INTEGER,
    "plannedDrawNumbersStr" TEXT,
    "roundSerial" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roundSerial" INTEGER NOT NULL,
    "seed" TEXT NOT NULL,
    "jackpotCode" TEXT NOT NULL,
    "jpGrowPerSec" REAL NOT NULL,
    "jpStartMini" INTEGER NOT NULL,
    "jpStartMain" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    CONSTRAINT "Draw_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Specials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moneyBag" INTEGER,
    "x2a" INTEGER,
    "x2b" INTEGER,
    "roundId" TEXT NOT NULL,
    CONSTRAINT "Specials_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Draw_roundId_order_key" ON "Draw"("roundId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Specials_roundId_key" ON "Specials"("roundId");
