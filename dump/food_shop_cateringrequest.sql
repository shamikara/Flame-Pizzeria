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
-- Table structure for table `cateringrequest`
--

DROP TABLE IF EXISTS `cateringrequest`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cateringrequest` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `eventType` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `eventDate` datetime(3) NOT NULL,
  `guestCount` int NOT NULL,
  `contactName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contactEmail` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `menuItems` json NOT NULL,
  `specialRequests` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cateringrequest`
--

LOCK TABLES `cateringrequest` WRITE;
/*!40000 ALTER TABLE `cateringrequest` DISABLE KEYS */;
INSERT INTO `cateringrequest` VALUES ('0ef39650-c968-424b-bb9e-e1f9d6a31c8f','corporate','2025-10-13 18:30:00.000',100,'hasaru','shamikara@gmail.com','{}','test','PENDING','2025-10-12 17:52:38.814'),('55790e04-07a3-46b6-a3bd-db424845358d','wedding','2025-10-12 18:30:00.000',50,'hasaru','shamikara@gmail.com','{}','this is test','PENDING','2025-10-12 16:43:52.379'),('560a1948-95dd-4c11-8bc0-e9a8af243851','birthday','2025-10-14 18:30:00.000',50,'hasaru','shamikara@gmail.com','{}','testmsg','PENDING','2025-10-12 17:44:59.251'),('85c7a095-9f76-4116-9869-980070f5305f','other','2025-10-13 18:30:00.000',50,'hasaru','shamikara@gmail.com','{}','test mail','PENDING','2025-10-12 17:23:08.320'),('b590deac-fbb6-466e-b0cf-8e3b740d3aff','wedding','2025-10-12 18:30:00.000',50,'hasaru','shamikara@gmail.com','{}','this is test','PENDING','2025-10-12 16:43:57.851'),('fe62a375-3244-47c2-b14b-b7bc55edeb1c','corporate','2025-10-13 18:30:00.000',50,'hasaru','shamikara@gmail.com','{}','this is test','PENDING','2025-10-12 16:46:50.856');
/*!40000 ALTER TABLE `cateringrequest` ENABLE KEYS */;
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
