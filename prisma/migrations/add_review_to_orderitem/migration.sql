-- Add reviewId column to orderitem table
ALTER TABLE `orderitem` ADD COLUMN `reviewId` INT NULL;

-- Add foreign key constraint
ALTER TABLE `orderitem` ADD CONSTRAINT `orderitem_reviewId_fkey` FOREIGN KEY (`reviewId`) REFERENCES `rating`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for better performance
CREATE INDEX `orderitem_reviewId_idx` ON `orderitem` (`reviewId`);
