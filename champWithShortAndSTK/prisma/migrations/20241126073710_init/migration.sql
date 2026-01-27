/*
  Warnings:

  - Added the required column `cis` to the `TickLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TickLog" ADD COLUMN     "cis" JSONB NOT NULL;
