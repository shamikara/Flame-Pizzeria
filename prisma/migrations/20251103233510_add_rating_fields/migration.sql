-- AlterTable
ALTER TABLE `fooditem` ADD COLUMN `averageRating` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `reviewCount` INTEGER NOT NULL DEFAULT 0;
