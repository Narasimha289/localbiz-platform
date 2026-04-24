-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "closingTime" TEXT NOT NULL DEFAULT '20:00',
ADD COLUMN     "openingTime" TEXT NOT NULL DEFAULT '09:00';
