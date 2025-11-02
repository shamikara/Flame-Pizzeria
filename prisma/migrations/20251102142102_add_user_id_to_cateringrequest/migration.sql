/*
  Warnings:

  - Added the required column `updatedAt` to the `cateringrequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `cateringrequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `cateringrequest` ADD COLUMN `contactPhone` VARCHAR(191) NULL,
    ADD COLUMN `depositAmount` DOUBLE NULL DEFAULT 0,
    ADD COLUMN `paymentIntentId` VARCHAR(191) NULL,
    ADD COLUMN `paymentStatus` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `totalAmount` DOUBLE NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `cateringrequest_userId_idx` ON `cateringrequest`(`userId`);

-- AddForeignKey
ALTER TABLE `cateringrequest` ADD CONSTRAINT `cateringrequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
