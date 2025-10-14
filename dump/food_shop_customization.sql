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
-- Table structure for table `customization`
--

DROP TABLE IF EXISTS `customization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customization` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` double NOT NULL,
  `foodItemId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Customization_foodItemId_fkey` (`foodItemId`),
  CONSTRAINT `Customization_foodItemId_fkey` FOREIGN KEY (`foodItemId`) REFERENCES `fooditem` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customization`
--

LOCK TABLES `customization` WRITE;
/*!40000 ALTER TABLE `customization` DISABLE KEYS */;
INSERT INTO `customization` VALUES (1,'Extra Cheese',150,1),(2,'Mushrooms',100,1),(3,'Extra Pepperoni',150,1),(4,'Extra Onions',75,1),(5,'Extra Bell Peppers',75,1),(6,'Extra Cheese',150,2),(7,'Mushrooms',100,2),(8,'Extra Pepperoni',150,2),(9,'Extra Onions',75,2),(10,'Extra Bell Peppers',75,2),(11,'Extra Cheese',150,3),(12,'Mushrooms',100,3),(13,'Extra Pepperoni',150,3),(14,'Extra Onions',75,3),(15,'Extra Bell Peppers',75,3),(16,'Extra Cheese',150,4),(17,'Extra Green Chilies',100,4),(18,'Extra Onion Rings',75,4),(19,'Extra Chicken',200,4),(20,'Extra Bell Peppers',75,4),(21,'Mushrooms',100,5),(22,'Extra Paneer',150,5),(23,'Extra Cheese',150,5),(24,'Extra Onions',75,5),(25,'Extra Bell Peppers',75,5),(26,'Extra Prawns',200,6),(27,'Spicy Mayo Drizzle',50,6),(28,'Extra Cheese',150,6),(29,'Extra Bell Peppers',75,6),(30,'Extra Cuttlefish',150,6),(31,'Extra Tomatoes',50,6),(32,'Double Patty',300,7),(33,'Bacon',150,7),(34,'Avocado',200,7),(35,'Extra Cheese',100,7),(36,'Fried Egg',150,7),(37,'Extra Lettuce',100,7),(38,'Extra Tomatoes',50,7),(39,'Double Patty',300,8),(40,'Extra Bacon',150,8),(41,'Extra Cheese',100,8),(42,'Extra Jalapeños',75,8),(43,'Mushrooms',100,8),(44,'Extra Onion Rings',50,8),(45,'Extra Meat',250,9),(46,'Extra Cheese',100,9),(47,'Avocado',200,9),(48,'Jalapeños',75,9),(49,'Banana Peppers',100,9),(50,'Extra Turkey',250,10),(51,'Extra Cheese',100,10),(52,'Avocado',200,10),(53,'Extra Bacon',150,10),(54,'Ranch Dressing',50,10),(55,'Extra Onion Rings',50,10),(56,'Extra Kottu',200,11),(57,'Fried Egg',100,11),(58,'Extra Cheese',150,11),(59,'Extra Tomato',50,11),(60,'Double Patty',300,12),(61,'Extra Cheese',150,12),(62,'Extra Bacon',150,12),(63,'Extra Cheese',100,12),(64,'Extra Tomato',50,12),(65,'Extra Spicy',50,12),(66,'Olives',100,1),(67,'Paneer Cubes',150,5),(68,'Extra Jalapeños',75,3),(69,'Extra Cheese',150,33),(70,'Extra Chicken',200,33),(71,'Extra Veggies',100,35),(72,'Extra Prawns',200,36),(73,'Extra Beef',250,37),(74,'Extra Cheese',150,38),(75,'Extra Spicy',50,38),(76,'Extra Cheese',150,39),(77,'Double Patty',300,30),(78,'Extra Cheese',100,30),(79,'Fried Egg',100,30),(80,'Extra Lettuce',50,30),(81,'Extra Cheese',100,31),(82,'Avocado',200,31),(83,'Extra Veggies',75,31),(84,'Extra Onion Rings',75,5),(85,'Extra Cheese',150,32),(86,'Mushrooms',100,32),(87,'Extra Paneer',150,32),(88,'Extra Onions',75,32),(89,'Extra Bell Peppers',75,32),(90,'Extra Cheese',150,41),(91,'Mushrooms',100,41),(92,'Extra Onions',75,41),(93,'Extra Bell Peppers',75,41),(94,'Mushrooms',100,30),(95,'Extra Onions',75,30),(96,'Extra Bell Peppers',75,30),(97,'Mushrooms',100,31),(98,'Extra Onions',75,31),(99,'Extra Bell Peppers',75,31),(100,'Extra Chicken',200,34),(101,'Extra Lemon Drizzle',50,34),(102,'Extra Cheese',100,35),(103,'Extra Herbs',50,35),(104,'Extra Seafood',200,36),(105,'Extra Cheese',150,36),(106,'Extra Cheese',150,37),(107,'Extra Beef',200,38),(108,'Extra Cheese',150,40),(109,'Extra Cuttlefish',150,36);
/*!40000 ALTER TABLE `customization` ENABLE KEYS */;
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
