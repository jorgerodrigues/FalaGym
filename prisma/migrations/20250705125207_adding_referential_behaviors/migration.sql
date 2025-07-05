-- DropForeignKey
ALTER TABLE "card" DROP CONSTRAINT "card_sentenceId_fkey";

-- DropForeignKey
ALTER TABLE "card_review_log" DROP CONSTRAINT "card_review_log_cardId_fkey";

-- DropForeignKey
ALTER TABLE "card_review_log" DROP CONSTRAINT "card_review_log_userId_fkey";

-- AlterTable
ALTER TABLE "card" ALTER COLUMN "sentenceId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "card_review_log" ALTER COLUMN "cardId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "card" ADD CONSTRAINT "card_sentenceId_fkey" FOREIGN KEY ("sentenceId") REFERENCES "sentence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_review_log" ADD CONSTRAINT "card_review_log_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_review_log" ADD CONSTRAINT "card_review_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
