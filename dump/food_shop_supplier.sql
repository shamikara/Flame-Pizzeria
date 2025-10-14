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
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'Pussella Meet producer (pvt) Ltd','+94112223344','pusellameet@example.com',1,'2025-10-08 18:54:05.606','2025-10-09 16:13:08.448'),(2,'Cargils ceylon PLC','+94412596827','cargils@gmail.com',1,'2025-10-08 18:54:05.606','2025-10-09 16:13:32.048'),(3,'Chaminda (pvt) Ltd','+94918526478','chaminda@gmail.com',1,'2025-10-09 16:05:20.979','2025-10-09 16:15:49.377'),(4,'Prima ceylon (Pvt) Ltd','+94786985628','prima@gmail.com',1,'2025-10-08 18:54:05.606','2025-10-09 16:19:18.997'),(5,'Wijaya product ','+94786398782','vijaya@gmal.com',1,'2025-10-08 18:54:05.606','2025-10-09 16:24:18.836'),(6,'Ceylon Fisheriese cooperation','+94568932548','fisherise@gmail.com',1,'2025-10-08 18:54:05.606','2025-10-09 16:24:18.836'),(7,'KDL Dairy farm (pvt) Ltd','+94786522122','dairy@gmail.com',1,'2025-10-09 16:20:31.012','2025-10-09 16:25:18.287'),(8,'Pussella Meet producer (pvt) Ltd','+94112223344','pusellameet@example.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(9,'Cargils ceylon PLC','+94412596827','cargils@gmail.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(10,'Chaminda (pvt) Ltd','+94918526478','chaminda@gmail.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(11,'Prima ceylon (Pvt) Ltd','+94786985628','prima@gmail.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(12,'Wijaya product','+94786398782','vijaya@gmal.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(13,'Ceylon Fisheriese cooperation','+94568932548','fisherise@gmail.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(14,'KDL Dairy farm (pvt) Ltd','+94786522122','dairy@gmail.com',1,'2025-10-09 10:08:22.000','2025-10-09 10:08:22.000'),(15,'Pussella Meet producer (pvt) Ltd','+94112223344','pusellameet@example.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(16,'Cargils ceylon PLC','+94412596827','cargils@gmail.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(17,'Chaminda (pvt) Ltd','+94918526478','chaminda@gmail.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(18,'Prima ceylon (Pvt) Ltd','+94786985628','prima@gmail.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(19,'Wijaya product','+94786398782','vijaya@gmal.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(20,'Ceylon Fisheriese cooperation','+94568932548','fisherise@gmail.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(21,'KDL Dairy farm (pvt) Ltd','+94786522122','dairy@gmail.com',1,'2025-10-09 10:12:26.000','2025-10-09 10:12:26.000'),(22,'Pussella Meet producer (pvt) Ltd','+94112223344','pusellameet@example.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(23,'Cargils ceylon PLC','+94412596827','cargils@gmail.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(24,'Chaminda (pvt) Ltd','+94918526478','chaminda@gmail.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(25,'Prima ceylon (Pvt) Ltd','+94786985628','prima@gmail.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(26,'Wijaya product','+94786398782','vijaya@gmal.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(27,'Ceylon Fisheriese cooperation','+94568932548','fisherise@gmail.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000'),(28,'KDL Dairy farm (pvt) Ltd','+94786522122','dairy@gmail.com',1,'2025-10-09 10:15:39.000','2025-10-09 10:15:39.000');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-14  6:15:20
