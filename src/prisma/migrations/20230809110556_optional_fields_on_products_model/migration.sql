-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "brand" DROP NOT NULL,
ALTER COLUMN "reference" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "stock" DROP NOT NULL;