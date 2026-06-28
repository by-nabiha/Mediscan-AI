-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScreeningSession" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScreeningSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XrayResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XrayResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkinResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "imagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkinResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiabetesResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiabetesResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentalHealthResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentalHealthResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "XrayResult_sessionId_key" ON "XrayResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SkinResult_sessionId_key" ON "SkinResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "DiabetesResult_sessionId_key" ON "DiabetesResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "MentalHealthResult_sessionId_key" ON "MentalHealthResult"("sessionId");

-- AddForeignKey
ALTER TABLE "ScreeningSession" ADD CONSTRAINT "ScreeningSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XrayResult" ADD CONSTRAINT "XrayResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkinResult" ADD CONSTRAINT "SkinResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiabetesResult" ADD CONSTRAINT "DiabetesResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentalHealthResult" ADD CONSTRAINT "MentalHealthResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScreeningSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
