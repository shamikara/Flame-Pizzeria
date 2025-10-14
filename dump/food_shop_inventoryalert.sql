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
-- Table structure for table `inventoryalert`
--

DROP TABLE IF EXISTS `inventoryalert`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventoryalert` (
  `id` int NOT NULL AUTO_INCREMENT,
  `message` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `severity` enum('LOW','EXPIRING','OUT','CRITICAL') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `resolved` tinyint(1) NOT NULL DEFAULT '0',
  `resolvedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `ingredientId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `InventoryAlert_ingredientId_fkey` (`ingredientId`),
  CONSTRAINT `InventoryAlert_ingredientId_fkey` FOREIGN KEY (`ingredientId`) REFERENCES `ingredient` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventoryalert`
--

LOCK TABLES `inventoryalert` WRITE;
/*!40000 ALTER TABLE `inventoryalert` DISABLE KEYS */;
INSERT INTO `inventoryalert` VALUES (1,'Flour stock low','LOW',0,NULL,'2025-10-08 18:54:05.729',1),(2,'Flour stock low','LOW',0,NULL,'2025-10-09 10:15:39.000',1),(44,'Bread Flour running low','LOW',0,NULL,'2025-10-09 10:20:06.000',1),(45,'Mozzarella Chees low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',2),(46,'All purpose flour about to expire','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',3),(47,'Kurakkan Flour critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',4),(48,'00 Flour running low','LOW',0,NULL,'2025-10-09 10:20:06.000',5),(49,'Eggs running low','LOW',0,NULL,'2025-10-09 10:20:06.000',6),(50,'Mozzarella Cheese expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',42),(51,'Butter low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',43),(52,'Fresh Milk expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',44),(53,'Yogurt about to expire','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',45),(54,'Chicken Breast critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',46),(55,'Chicken Sausages running low','LOW',0,NULL,'2025-10-09 10:20:06.000',47),(56,'Beef stock low','LOW',0,NULL,'2025-10-09 10:20:06.000',48),(57,'Mutton critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',49),(58,'Fish (Seer) expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',50),(59,'Prawns low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',51),(60,'Tomato low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',52),(61,'Onion stock critical','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',53),(62,'Capsicum expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',54),(63,'Mushroom low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',55),(64,'Carrot running low','LOW',0,NULL,'2025-10-09 10:20:06.000',56),(65,'Cabbage stock critical','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',57),(66,'Leeks expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',58),(67,'Green Chili low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',59),(68,'Curry Leaves running low','LOW',0,NULL,'2025-10-09 10:20:06.000',60),(69,'Salt stock critical','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',61),(70,'Sugar running low','LOW',0,NULL,'2025-10-09 10:20:06.000',62),(71,'Black Pepper critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',63),(72,'Chili Flakes expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',64),(73,'Sesame Seeds critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',65),(74,'Cinnamon running low','LOW',0,NULL,'2025-10-09 10:20:06.000',66),(75,'Cardamom expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',67),(76,'Cooking Oil low stock','LOW',0,NULL,'2025-10-09 10:20:06.000',68),(77,'Margarine running low','LOW',0,NULL,'2025-10-09 10:20:06.000',69),(78,'Tomato Sauce critically low','CRITICAL',0,NULL,'2025-10-09 10:20:06.000',70),(79,'Mayonnaise expiring soon','EXPIRING',0,NULL,'2025-10-09 10:20:06.000',71);
/*!40000 ALTER TABLE `inventoryalert` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14  6:15:21
