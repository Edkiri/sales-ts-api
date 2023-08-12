-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_saleId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
