/*
  Warnings:

  - You are about to drop the column `type` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "deletedAt" SET DEFAULT null;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "type";

-- DropEnum
DROP TYPE "PaymentType";
