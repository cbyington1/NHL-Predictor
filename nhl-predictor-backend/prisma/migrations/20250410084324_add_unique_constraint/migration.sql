/*
  Warnings:

  - A unique constraint covering the columns `[gameId,homeTeamId,awayTeamId]` on the table `Prediction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Prediction_gameId_homeTeamId_awayTeamId_key" ON "Prediction"("gameId", "homeTeamId", "awayTeamId");
