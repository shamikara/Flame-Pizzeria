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
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','MANAGER','STORE_KEEP','CHEF','WAITER','DELIVERY_PERSON','KITCHEN_HELPER','CUSTOMER') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `resetToken` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resetTokenExpiry` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'Ruwan','Perera','manager1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000001','MANAGER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(2,'Sajith','Fernando','asstmanager@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Kandy','+94710000002','MANAGER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(3,'Mahesh','Kumara','headchef@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000003','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(4,'Sameera','Silva','souschef1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000004','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(5,'Niroshan','Dissanayake','souschef2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000005','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(6,'Sunil','Jayasinghe','stationchef1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000006','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(7,'Chaminda','Rajapaksha','stationchef2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000007','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(8,'Roshan','Perera','stationchef3@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000008','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(9,'Kasun','Bandara','commischef1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000009','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(10,'Ranjan','Liyanage','commischef2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000010','CHEF',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(11,'Sampath','Fernando','helper1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000011','KITCHEN_HELPER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(12,'Anura','Jayalath','helper2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000012','KITCHEN_HELPER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(13,'Milan','Perera','waiter1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000013','WAITER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(14,'Nuwan','Ranasinghe','waiter2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000014','WAITER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(15,'Tharindu','Silva','waiter3@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000015','WAITER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(16,'Ravindu','Jayawardena','waiter4@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000016','WAITER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(17,'Ishan','Bandara','assistant1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000017','WAITER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(18,'Supun','Perera','delivery1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000018','DELIVERY_PERSON',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(19,'Dilan','Weerasinghe','delivery2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000019','DELIVERY_PERSON',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(20,'Ashan','Fernando','delivery3@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000020','DELIVERY_PERSON',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(21,'Ruwan','Jayasekara','storekeeper@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000021','STORE_KEEP',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(22,'Kavindu','Perera','customer1@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Galle','+94710000022','CUSTOMER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(23,'Sahan','Fernando','customer2@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Kandy','+94710000023','CUSTOMER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(24,'Amila','Silva','customer3@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Negombo','+94710000024','CUSTOMER',1,'2025-10-10 15:45:52.000','2025-10-10 15:45:52.000',NULL,NULL),(25,'Admin','SuperUser','admin@example.com','$2b$10$EhtczwVDPxk/W1JdkAgqCedJcXA3SuYsZCLI50KbadnHLc1Yoaoam','Colombo','+94710000001','ADMIN',1,'2025-10-08 18:54:05.647','2025-10-10 15:49:34.166','f47bfea4df8d153e23983e01da8777df40fe6e3f9d62cf3f1f18388db4fd5a92','2025-10-10 16:49:34.164'),(26,'dilshi','hewapura','dilshi@gmail.com','$2b$10$TNstZswhIRaiaR850fWzWuMAkMNSHRJyXtvojgNrgo0m0C3p4SBJS','12,galle rd, cmb, cmb, 10650','0771231234','CUSTOMER',1,'2025-10-12 04:48:50.745','2025-10-12 04:48:50.745',NULL,NULL),(27,'hasaru','shamikara','hasaru@gmail.com','$2b$10$fufM/TC0ZQfA3aUbFZoZx.o.ZUusntlyyx.hB/VTHbBq4V7DPvtRC','123,wela asl, cmb','07745484582','CUSTOMER',1,'2025-10-14 00:17:34.661','2025-10-14 00:17:34.661',NULL,NULL);
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

-- Dump completed on 2025-10-14  6:15:21
