/*
  Warnings:

  - You are about to drop the column `slug` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `supplier` table. All the data in the column will be lost.
  - You are about to drop the `_customizationtofooditem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `customization` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[foodItemId]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.
  - Made the column `foodItemId` on table `orderitem` required. This step will fail if there are existing NULL values in that column.
  - Made the column `foodItemId` on table `rating` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `foodItemId` to the `Recipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_customizationtofooditem` DROP FOREIGN KEY `_CustomizationToFoodItem_A_fkey`;

-- DropForeignKey
ALTER TABLE `_customizationtofooditem` DROP FOREIGN KEY `_CustomizationToFoodItem_B_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_foodItemId_fkey`;

-- DropForeignKey
ALTER TABLE `rating` DROP FOREIGN KEY `Rating_foodItemId_fkey`;

-- DropIndex
DROP INDEX `Category_slug_key` ON `category`;

-- DropIndex
DROP INDEX `FoodItem_name_key` ON `fooditem`;

-- DropIndex
DROP INDEX `OrderItem_foodItemId_fkey` ON `orderitem`;

-- DropIndex
DROP INDEX `Rating_foodItemId_fkey` ON `rating`;

-- AlterTable
ALTER TABLE `category` DROP COLUMN `slug`;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `foodItemId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `rating` MODIFY `foodItemId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `recipe` ADD COLUMN `foodItemId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `address`;

-- DropTable
DROP TABLE `_customizationtofooditem`;

-- DropTable
DROP TABLE `customization`;

-- CreateTable
CREATE TABLE `RecipeIngredient` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `unit` ENUM('KG', 'G', 'L', 'ML', 'PIECE') NOT NULL,
    `recipeId` VARCHAR(191) NOT NULL,
    `rawMaterialId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Recipe_foodItemId_key` ON `Recipe`(`foodItemId`);

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `FoodItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Recipe` ADD CONSTRAINT `Recipe_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `FoodItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_recipeId_fkey` FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecipeIngredient` ADD CONSTRAINT `RecipeIngredient_rawMaterialId_fkey` FOREIGN KEY (`rawMaterialId`) REFERENCES `RawMaterial`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `FoodItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
