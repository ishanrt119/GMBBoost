/*
  Warnings:

  - You are about to drop the column `approved` on the `posts` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PostStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "approved",
ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL';
