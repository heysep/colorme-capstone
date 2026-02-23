/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.7-MariaDB, for osx10.20 (arm64)
--
-- Host: 127.0.0.1    Database: nx_cms_database
-- ------------------------------------------------------
-- Server version	11.4.4-MariaDB-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

USE `logsdb`;

--
-- Table structure for table `rn_default_log_mx`
--

DROP TABLE IF EXISTS `rn_default_log_mx`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `rn_default_log_mx` (
  `createdAt` datetime(6) NOT NULL DEFAULT current_timestamp(6) COMMENT '생성일시',
  `updatedAt` datetime(6) DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6) COMMENT '수정일시',
  `deletedAt` datetime(6) DEFAULT NULL COMMENT '삭제일시 (soft delete)',
  `id` varchar(50) NOT NULL COMMENT '로그 고유 아이디',
  `level` varchar(200) DEFAULT NULL COMMENT '로그 레벨',
  `message` mediumtext DEFAULT NULL COMMENT '로그 메시지',
  `url` text DEFAULT NULL COMMENT 'URL',
  `statusCode` varchar(200) DEFAULT NULL COMMENT '상태 코드',
  `resultCode` varchar(200) DEFAULT NULL COMMENT '결과 코드',
  `contextName` varchar(500) DEFAULT NULL COMMENT '컨텍스트 이름',
  `method` varchar(500) DEFAULT NULL COMMENT '메서드 이름',
  `ip` varchar(500) DEFAULT NULL COMMENT 'IP 주소',
  `userAgent` varchar(500) DEFAULT NULL COMMENT '사용자 에이전트',
  `userId` varchar(500) DEFAULT NULL COMMENT '사용자 아이디',
  PRIMARY KEY (`id`),
  KEY `IDX_cfa86d1ec5b2e8f2d3cf932995` (`createdAt`),
  KEY `IDX_1314d532d0d563c25efd7cbf5c` (`deletedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='기본 로그 테이블';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-08-28 10:36:01
