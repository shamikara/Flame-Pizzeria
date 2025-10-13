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
-- Table structure for table `fooditem`
--

DROP TABLE IF EXISTS `fooditem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fooditem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` double NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `categoryId` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FoodItem_categoryId_fkey` (`categoryId`),
  CONSTRAINT `FoodItem_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fooditem`
--

LOCK TABLES `fooditem` WRITE;
/*!40000 ALTER TABLE `fooditem` DISABLE KEYS */;
INSERT INTO `fooditem` VALUES (1,'Margherita Pizza','Classic tomato sauce, fresh mozzarella, basil',1399,'img/fooditems/1.png?height=300&width=300',1,'2025-10-08 18:54:05.631','2025-10-09 06:04:13.001',1),(2,'Black Chicken Pizza','BBQ sauce, fresh mozzarella, basil and black chicken curry topping',1699,'img/fooditems/2.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 06:04:13.001',1),(3,'Pepperoni Pizza','Classic pepperoni pizza with extra cheese',1499,'img/fooditems/3.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-08 18:54:05.637',1),(4,'Spicy Lankan Chicken Pizza','Tandoori chicken, onions, green chili, mozzarella',1450,'img/fooditems/4.png?height=300&width=300',1,'2025-10-08 18:54:05.631','2025-10-09 06:01:17.158',1),(5,'Veg Kurakkan Pizza','Healthy Kurakkan base with local veggies and herbs',1350,'img/fooditems/5.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:02:12.163',1),(6,'Seafood Delight Pizza','Prawns, cuttlefish, and spicy seafood sauce',1650,'img/fooditems/6.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:04:46.227',1),(7,'Classic Cheeseburger','Beef patty, cheese, lettuce, tomato, special sauce',1099,'img/fooditems/7.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:07:01.962',2),(8,'BBQ Bacon Burger','Beef patty, bacon, cheddar, BBQ sauce, onion rings',1299,'img/fooditems/8.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:09:40.675',2),(9,'Italian Sub','Ham, salami, pepperoni, provolone, lettuce, tomato, Italian dressing',1099,'img/fooditems/9.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:12:30.198',2),(10,'Turkey Club Sub','Turkey, bacon, lettuce, tomato, mayo on a fresh baked roll',1199,'img/fooditems/10.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:14:34.261',2),(11,'Kottu Submarine','Chicken kottu in a submarine roll with melted cheese',950,'img/fooditems/11.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:16:39.566',2),(12,'Lankan Spicy Burger','Beef patty, seeni sambol, cheese, and lunu miris',999,'img/fooditems/12.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:18:36.015',2),(13,'Fish Bun','Spicy Sri Lankan fish curry inside a fluffy bun',80,'img/fooditems/13.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:21:03.785',3),(14,'Egg Roll','Crispy roll stuffed with savory fish, fresh vegetables, and eggs',130,'img/fooditems/14.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:22:33.881',3),(15,'Chicken Patty','Golden crust filled with curried chicken and potato',120,'img/fooditems/15.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:32:45.292',3),(16,'Vegetable Roti','Flatbread filled with spiced fresh vegetables',100,'img/fooditems/16.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:34:21.864',3),(17,'Jam Bun','Fluffy bun oozing with rich jam and a touch of cheese cream',180,'img/fooditems/17.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:35:44.446',3),(18,'Sausage Roll','Puff pastry with local grilled sausage filling',150,'img/fooditems/18.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 09:37:27.792',3),(19,'Faluda','Rose milk with ice cream, basil seeds, jelly & syrup',450,'img/fooditems/19.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 11:11:57.714',4),(20,'Watalappan','Traditional jaggery pudding with coconut and eggs',300,'img/fooditems/20.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 11:13:35.021',4),(21,'Fruit Salad','Fresh fruits with honey and mint, served with cheesy ice cream',450,'img/fooditems/21.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 11:14:50.504',4),(22,'Woodapple Juice','Cool and tangy woodapple drink made fresh',220,'img/fooditems/23.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 11:15:58.363',4),(23,'Iced Milo','Chilled Milo with ice and sweetened milk',250,'img/fooditems/22.png?height=300&width=300',1,'2025-10-08 18:54:05.637','2025-10-09 11:15:59.680',4);
/*!40000 ALTER TABLE `fooditem` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 11:17:04
