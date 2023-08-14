/*
  Warnings:

  - The `status` column on the `Sale` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "deletedAt" SET DEFAULT null;

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "status",
ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "SaleStatus";
