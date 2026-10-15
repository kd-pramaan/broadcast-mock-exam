-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

