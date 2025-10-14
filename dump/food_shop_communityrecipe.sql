-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: food_shop
-- ------------------------------------------------------
-- Server version	9.3.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `communityrecipe`
--

DROP TABLE IF EXISTS `communityrecipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communityrecipe` (
  `id` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `authorId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CommunityRecipe_status_idx` (`status`),
  KEY `CommunityRecipe_authorId_idx` (`authorId`),
  CONSTRAINT `CommunityRecipe_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communityrecipe`
--

LOCK TABLES `communityrecipe` WRITE;
/*!40000 ALTER TABLE `communityrecipe` DISABLE KEYS */;
INSERT INTO `communityrecipe` VALUES ('46','Pol Roti','Mix flour, scraped coconut, water, and salt into dough. Flatten and cook on a hot griddle. Serve hot with lunu miris.','https://example.com/images/pol_roti.jpg','APPROVED','2025-10-08 18:54:05.000','2025-10-09 10:15:39.000',7),('47','Kottu Roti','Chop godamba roti, mix with vegetables, egg, and chicken curry on a hot griddle for a flavorful dish.','https://example.com/images/kottu_roti.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',12),('48','Watalappan','Whisk eggs, coconut milk, and jaggery with cardamom. Steam until firm and serve chilled.','https://example.com/images/watalappan.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',13),('49','Kiribath with Seeni Sambol','Cook rice with coconut milk until creamy, spread, cut into diamonds, and serve with spicy onion sambol.','https://example.com/images/kiribath.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',14),('50','String Hoppers & Kiri Hodi','Press rice flour dough into hoppers, steam, and serve with coconut milk gravy.','https://example.com/images/string_hoppers.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',15),('51','Parippu Curry','Cook red lentils with turmeric, add coconut milk and tempered spices for a creamy curry.','https://example.com/images/parippu_curry.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',16),('52','Fish Ambul Thiyal','Marinate fish with goraka and spices, then cook until dry in a clay pot for a tangy flavor.','https://example.com/images/fish_ambul_thiyal.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',17),('53','Pittu & Coconut Milk','Layer rice flour and coconut in a pittu maker, steam, and serve with coconut milk.','https://example.com/images/pittu.jpg','APPROVED','2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',18),('54','Egg Hoppers','Make a thin fermented rice flour batter, pour into a small wok, crack an egg inside, and cook until crispy.','https://example.com/images/egg_hoppers.jpg','APPROVED','2025-10-09 11:10:26.000','2025-10-09 12:00:00.000',19),('55','Chicken Fried Rice','Stir-fry cooked rice with egg, chicken, soy sauce, and vegetables for a flavorful meal.','https://example.com/images/chicken_fried_rice.jpg','APPROVED','2025-10-09 11:15:26.000','2025-10-09 12:01:00.000',20),('56','Devilled Chicken','Marinate chicken pieces with chili and soy sauce, fry until crispy, then mix with onions and capsicum.','https://example.com/images/devilled_chicken.jpg','APPROVED','2025-10-09 11:20:26.000','2025-10-09 12:02:00.000',21),('57','Cheese Pizza','Prepare dough, spread tomato sauce, top with cheese, and bake until golden.','https://example.com/images/cheese_pizza.jpg','APPROVED','2025-10-09 11:25:26.000','2025-10-09 12:03:00.000',7),('58','Nasi Goreng','Fry cooked rice with chili paste, soy sauce, egg, shrimp, and vegetables for a spicy Indonesian dish.','https://example.com/images/nasi_goreng.jpg','APPROVED','2025-10-09 11:30:26.000','2025-10-09 12:04:00.000',12),('59','Samosa','Fill pastry with spiced potatoes or minced meat, fold into triangles, and deep-fry until golden brown.','https://example.com/images/samosa.jpg','APPROVED','2025-10-09 11:35:26.000','2025-10-09 12:05:00.000',13),('60','Chocolate Cake','Mix flour, cocoa, eggs, butter, and sugar. Bake, cool, and frost with chocolate icing.','https://example.com/images/chocolate_cake.jpg','APPROVED','2025-10-09 11:40:26.000','2025-10-09 12:06:00.000',14),('cmgk5sdpz0001e1vscdts7f5y','kottu','choped vegiess rtfrsrw yvyfv',NULL,'APPROVED','2025-10-10 01:19:33.222','2025-10-10 01:20:07.785',47);
/*!40000 ALTER TABLE `communityrecipe` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14  6:15:22
