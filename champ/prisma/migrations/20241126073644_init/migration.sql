-- CreateTable
CREATE TABLE "TickLog" (
    "id" SERIAL NOT NULL,
    "scriptName" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "tickTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TickLog_pkey" PRIMARY KEY ("id")
);
