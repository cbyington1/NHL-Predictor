-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "homeTeamId" INTEGER NOT NULL,
    "awayTeamId" INTEGER NOT NULL,
    "predictedHomeScore" DOUBLE PRECISION NOT NULL,
    "predictedAwayScore" DOUBLE PRECISION NOT NULL,
    "homeWinProbability" DOUBLE PRECISION NOT NULL,
    "awayWinProbability" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gameStartTime" TIMESTAMP(3) NOT NULL,
    "gameStatus" TEXT NOT NULL,
    "actualHomeScore" INTEGER,
    "actualAwayScore" INTEGER,
    "wasCorrect" BOOLEAN,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prediction_gameId_idx" ON "Prediction"("gameId");
