-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: food_shop
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `recipe`
--

DROP TABLE IF EXISTS `recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `steps` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `foodItemId` int NOT NULL,
  `authorId` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Recipe_foodItemId_key` (`foodItemId`),
  KEY `Recipe_authorId_fkey` (`authorId`),
  CONSTRAINT `Recipe_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Recipe_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `fooditem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe`
--

LOCK TABLES `recipe` WRITE;
/*!40000 ALTER TABLE `recipe` DISABLE KEYS */;
INSERT INTO `recipe` VALUES (1,'Margherita Pizza Recipe','Pol Roti made with scraped coconut and wheat flour, served hot with spicy lunu miris.','Mix flour with scraped coconut, water, and salt. Flatten and cook on hot griddle. Serve with lunu miris.',1,'2025-10-08 18:54:05.713','2025-10-09 10:15:39.000',1,2),(2,'Kottu Roti','Chopped godamba roti mixed with vegetables, egg, and chicken curry.','Chop roti, stir-fry with vegetables, egg, and chicken curry.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',2,2),(3,'Watalappan','Coconut custard pudding with jaggery, cardamom, and nutmeg.','Whisk eggs, coconut milk, and jaggery. Steam in ramekins. Chill before serving.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',3,2),(4,'Kiribath with Seeni Sambol','Traditional milk rice served with onion sambol.','Cook rice with coconut milk until soft. Spread, cut into diamonds. Serve with sambol.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',4,2),(5,'String Hoppers & Kiri Hodi','Rice flour nests with coconut milk gravy.','Press rice flour dough into hoppers. Steam. Serve with kiri hodi.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',5,2),(6,'Parippu Curry','Creamy red lentil curry with coconut milk and spices.','Cook dal with turmeric. Add coconut milk, tempered spices.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',6,2),(7,'Fish Ambul Thiyal','Sour spicy fish curry with goraka.','Marinate fish with goraka and spices. Cook in clay pot until dry.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',7,2),(8,'Pittu & Coconut Milk','Steamed rice flour cylinders with coconut.','Layer rice flour and coconut in pittu maker. Steam. Serve with coconut milk.',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000',8,2);
/*!40000 ALTER TABLE `recipe` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 11:17:03
