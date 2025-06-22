/*
  Warnings:

  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "role" SET DEFAULT 'REGULAR';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role";
