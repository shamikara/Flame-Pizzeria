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
-- Table structure for table `orderitem`
--

DROP TABLE IF EXISTS `orderitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `price` double NOT NULL,
  `specialNotes` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customizations` json DEFAULT NULL,
  `orderId` int NOT NULL,
  `foodItemId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `OrderItem_orderId_fkey` (`orderId`),
  KEY `OrderItem_foodItemId_fkey` (`foodItemId`),
  CONSTRAINT `OrderItem_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `fooditem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `order` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitem`
--

LOCK TABLES `orderitem` WRITE;
/*!40000 ALTER TABLE `orderitem` DISABLE KEYS */;
INSERT INTO `orderitem` VALUES (1,1,1399,NULL,'\"[{\\\"id\\\":1,\\\"name\\\":\\\"Extra Cheese\\\",\\\"price\\\":150}]\"',1,5),(2,1,450,NULL,NULL,1,2),(3,1,130,NULL,'[]',2,14),(4,1,450,NULL,'[]',2,19),(5,5,180,NULL,'[]',3,17),(6,3,80,NULL,'[]',3,13),(7,4,1299,NULL,'[{\"id\": 39, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 41, \"name\": \"Extra Cheese\", \"price\": 100}]',3,8),(8,3,999,NULL,'[{\"id\": 60, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 63, \"name\": \"Extra Cheese\", \"price\": 100}]',4,12),(9,2,1099,NULL,'[{\"id\": 32, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 34, \"name\": \"Avocado\", \"price\": 200}, {\"id\": 35, \"name\": \"Extra Cheese\", \"price\": 100}]',4,7),(10,1,1650,NULL,'[{\"id\": 26, \"name\": \"Extra Prawns\", \"price\": 200}, {\"id\": 28, \"name\": \"Extra Cheese\", \"price\": 150}, {\"id\": 30, \"name\": \"Extra Cuttlefish\", \"price\": 150}]',4,6),(11,1,100,NULL,'[]',4,16),(12,2,450,NULL,'[]',4,21),(13,1,220,NULL,'[]',4,22),(14,1,450,NULL,'[]',4,19),(15,1,1299,NULL,'[{\"id\": 39, \"name\": \"Double Patty\", \"price\": 300}]',5,8),(16,3,450,NULL,'[]',6,19),(17,3,300,NULL,'[]',6,23),(18,1,450,NULL,'[]',7,21),(19,1,1099,NULL,'[{\"id\": 32, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 33, \"name\": \"Bacon\", \"price\": 150}, {\"id\": 35, \"name\": \"Extra Cheese\", \"price\": 100}]',8,7),(20,1,1099,NULL,'[{\"id\": 32, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 33, \"name\": \"Bacon\", \"price\": 150}, {\"id\": 35, \"name\": \"Extra Cheese\", \"price\": 100}]',9,7),(21,1,1099,NULL,'[{\"id\": 32, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 33, \"name\": \"Bacon\", \"price\": 150}, {\"id\": 35, \"name\": \"Extra Cheese\", \"price\": 100}]',10,7),(22,1,1099,NULL,'[{\"id\": 32, \"name\": \"Double Patty\", \"price\": 300}, {\"id\": 33, \"name\": \"Bacon\", \"price\": 150}, {\"id\": 35, \"name\": \"Extra Cheese\", \"price\": 100}]',11,7);
/*!40000 ALTER TABLE `orderitem` ENABLE KEYS */;
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
