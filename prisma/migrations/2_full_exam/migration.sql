-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'short';
ALTER TABLE "Exam" ADD COLUMN     "papers" JSONB;
ALTER TABLE "Exam" ALTER COLUMN "questions" SET DEFAULT '[]';

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "paperChoice" TEXT;
ALTER TABLE "Attempt" ADD COLUMN     "paperScores" JSONB;
