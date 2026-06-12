-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "ownerName" TEXT,
    "ownerPhone" TEXT,
    "address" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "qrCodeUrl" TEXT,
    "billNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "isDaily" BOOLEAN NOT NULL DEFAULT false,
    "rent" REAL NOT NULL DEFAULT 0,
    "commonFee" REAL NOT NULL DEFAULT 0,
    "elecMeterType" TEXT NOT NULL DEFAULT 'SINGLE',
    "waterMeterType" TEXT NOT NULL DEFAULT 'UNIT',
    "occupantsCount" INTEGER NOT NULL DEFAULT 1,
    "elecRate" REAL,
    "waterRate" REAL,
    "waterMinCharge" REAL,
    "waterFlatRate" REAL,
    "paymentDate" INTEGER,
    "note" TEXT,
    "tenantName" TEXT,
    "tenantPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Room_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "billingMonth" INTEGER NOT NULL,
    "billingYear" INTEGER NOT NULL,
    "billDate" DATETIME NOT NULL,
    "oldElecMeter" REAL,
    "newElecMeter" REAL,
    "oldElecMeterB" REAL,
    "newElecMeterB" REAL,
    "oldWaterMeter" REAL,
    "newWaterMeter" REAL,
    "elecTotal" REAL NOT NULL DEFAULT 0,
    "waterTotal" REAL NOT NULL DEFAULT 0,
    "rentTotal" REAL NOT NULL DEFAULT 0,
    "commonFeeTotal" REAL NOT NULL DEFAULT 0,
    "grandTotal" REAL NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Invoice_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_apartmentId_name_key" ON "Room"("apartmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_roomId_billingMonth_billingYear_key" ON "Invoice"("roomId", "billingMonth", "billingYear");
