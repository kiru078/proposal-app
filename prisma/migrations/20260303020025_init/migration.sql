-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "companyName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientCompany" TEXT,
    "clientPhone" TEXT,
    "title" TEXT NOT NULL,
    "coverLetter" TEXT,
    "notes" TEXT,
    "terms" TEXT,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "validUntil" DATETIME,
    "publicToken" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sentAt" DATETIME,
    "viewedAt" DATETIME,
    CONSTRAINT "proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "proposal_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proposalId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "proposal_items_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_publicToken_key" ON "proposals"("publicToken");

-- CreateIndex
CREATE INDEX "proposals_userId_idx" ON "proposals"("userId");

-- CreateIndex
CREATE INDEX "proposals_publicToken_idx" ON "proposals"("publicToken");

-- CreateIndex
CREATE INDEX "proposal_items_proposalId_idx" ON "proposal_items"("proposalId");
