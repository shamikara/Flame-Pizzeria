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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','MANAGER','STORE_KEEP','CHEF','WAITER','DELIVERY_PERSON','KITCHEN_HELPER','CUSTOMER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Admin','User','admin@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000001','ADMIN',1,'2025-10-08 18:54:05.647','2025-10-09 10:15:39.000'),(2,'Chef','User','chef@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000002','CHEF',1,'2025-10-08 18:54:05.653','2025-10-09 10:15:39.000'),(3,'Manager','User','manager@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000003','MANAGER',1,'2025-10-08 18:54:05.657','2025-10-09 10:15:39.000'),(4,'Waiter','User','waiter@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000004','WAITER',1,'2025-10-08 18:54:05.661','2025-10-09 10:15:39.000'),(5,'Delivery','User','delivery@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000005','DELIVERY_PERSON',1,'2025-10-08 18:54:05.665','2025-10-09 10:15:39.000'),(6,'Helper','User','helper@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000006','KITCHEN_HELPER',1,'2025-10-08 18:54:05.669','2025-10-09 10:15:39.000'),(7,'Customer1','User','customer1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam',NULL,NULL,'CUSTOMER',1,'2025-10-08 18:54:05.673','2025-10-08 18:54:05.673'),(12,'Kamal','Perera','kamal.perera@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo 05','+94711234567','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(13,'Sunethra','Fernando','sunethra.fernando@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Kandy','+94773456789','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(14,'Ruwan','Silva','ruwan.silva@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Galle','+94776543210','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(15,'Nadeesha','Wijesinghe','nadeesha.wijesinghe@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Negombo','+94712349876','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(16,'Chathura','Jayawardena','chathura.jayawardena@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Kurunegala','+94719876543','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(17,'Ishara','Bandara','ishara.bandara@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Matara','+94775432109','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(18,'Harsha','Gunawardena','harsha.gunawardena@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Rathnapura','+94714567890','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(19,'Sanjeewa','Edirisinghe','sanjeewa.edirisinghe@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Anuradhapura','+94716789012','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(20,'Dilani','Dias','dilani.dias@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Batticaloa','+94717890123','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(21,'Tharindu','Kumara','tharindu.kumara@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Badulla','+94718901234','CUSTOMER',1,'2025-10-09 10:12:26.000','2025-10-09 10:15:39.000'),(44,'Anuja','Nimsara','anuja@gmaill.com','$2b$10$vQYiu./6rBTo01Ju6vcWO.XpwvvEBsQGDFIratSk8rc9yJeI7ZjzC','Kekanadura, Matara, Matara, 1996','0768529567','CUSTOMER',1,'2025-10-09 17:48:47.424','2025-10-09 17:48:47.424'),(45,'Chamath','Delagala','chamath@gmail.com','$2b$10$UNTF23JuonUeNViw03NqH.00A/nvZz/8CVyDzsThEO67fOJC8.wIO',NULL,NULL,'CHEF',1,'2025-10-09 18:05:43.766','2025-10-09 18:05:43.766');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 11:17:02
