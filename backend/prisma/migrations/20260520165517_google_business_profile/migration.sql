-- AlterTable
ALTER TABLE "business_profiles" ADD COLUMN     "googleAccountId" TEXT,
ADD COLUMN     "googleConnected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "googleLocationId" TEXT;
