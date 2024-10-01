-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: mysql
-- Generation Time: Oct 01, 2024 at 11:35 AM
-- Server version: 9.0.1
-- PHP Version: 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `helpdesk_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `knowledge_base`
--

CREATE TABLE `knowledge_base` (
  `id` int NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `knowledge_base`
--

INSERT INTO `knowledge_base` (`id`, `question`, `answer`, `created_at`, `updated_at`, `user_id`) VALUES
(30, 'd', 'da', '2024-09-30 20:58:32', '2024-09-30 20:58:32', 3);

-- --------------------------------------------------------

--
-- Table structure for table `queues`
--

CREATE TABLE `queues` (
  `id` int NOT NULL,
  `ticketId` int NOT NULL,
  `priority` varchar(20) DEFAULT 'Normal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `queues`
--

INSERT INTO `queues` (`id`, `ticketId`, `priority`) VALUES
(10, 10, 'Low'),
(11, 12, 'Low'),
(12, 11, 'Low'),
(13, 13, 'Medium'),
(14, 14, 'Medium'),
(17, 22, 'Medium'),
(18, 23, 'Medium'),
(19, 24, 'Urgent'),
(20, 28, 'Medium'),
(21, 25, 'High'),
(22, 27, 'Medium'),
(23, 30, 'Medium'),
(24, 26, 'Medium');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  `usageData` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `title`, `date`, `usageData`) VALUES
(1, 'staff แอบมองผม', '2024-10-01 02:12:55', 'ไม่บอก'),
(2, 'staff แอบมองผม', '2024-10-01 02:58:59', 'dasdadasd');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int NOT NULL,
  `userId` int NOT NULL,
  `issue` text NOT NULL,
  `status` enum('New','Assigned','In Progress','Resolved','Closed') DEFAULT 'New',
  `assigned_to` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `queue_id` int DEFAULT NULL,
  `priority` enum('High','Medium','Low') DEFAULT 'Medium'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `userId`, `issue`, `status`, `assigned_to`, `created_at`, `updated_at`, `queue_id`, `priority`) VALUES
(10, 1, 'หิว', 'Closed', NULL, '2024-10-01 09:16:38', '2024-10-01 09:22:52', NULL, 'Medium'),
(11, 1, 'dasdasd', 'Closed', NULL, '2024-10-01 09:28:17', '2024-10-01 09:31:48', NULL, 'Medium'),
(12, 1, 'dasdad', 'Closed', NULL, '2024-10-01 09:28:19', '2024-10-01 09:45:36', NULL, 'Medium'),
(13, 1, 'dasda', 'Closed', NULL, '2024-10-01 09:46:02', '2024-10-01 09:54:08', NULL, 'Medium'),
(14, 1, 'dasdasds', 'Closed', NULL, '2024-10-01 09:54:25', '2024-10-01 10:33:16', NULL, 'Medium'),
(22, 1, 'dasd', 'Assigned', NULL, '2024-10-01 10:28:04', '2024-10-01 10:28:28', NULL, 'Medium'),
(23, 1, 'dasd', 'Assigned', NULL, '2024-10-01 10:28:06', '2024-10-01 10:33:46', NULL, 'Medium'),
(24, 1, 'dasdasdasd', 'Assigned', NULL, '2024-10-01 10:28:08', '2024-10-01 10:33:49', NULL, 'Medium'),
(25, 1, 'dasdas', 'Assigned', NULL, '2024-10-01 10:28:10', '2024-10-01 11:07:27', NULL, 'Medium'),
(26, 2, 'mmm', 'In Progress', NULL, '2024-10-01 10:37:53', '2024-10-01 11:21:06', NULL, 'Medium'),
(27, 2, 'mmm', 'Assigned', NULL, '2024-10-01 10:37:55', '2024-10-01 11:07:35', NULL, 'Medium'),
(28, 2, 'mmm', 'Resolved', NULL, '2024-10-01 10:37:59', '2024-10-01 11:21:14', NULL, 'Medium'),
(29, 1, 'dasda', 'New', NULL, '2024-10-01 11:05:31', '2024-10-01 11:05:31', NULL, 'Medium'),
(30, 1, 'dasdas', 'Assigned', NULL, '2024-10-01 11:05:34', '2024-10-01 11:10:02', NULL, 'Medium');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` enum('user','staff') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`, `updated_at`) VALUES
(1, 'aa', '$2b$10$e2WL8wdNZ3F1cGl6IawK8uvmGPuUB2j4svm7qmb1QXksxsPFaBtEy', 'aa@gmail.com', 'user', '2024-09-30 06:37:27', '2024-09-30 06:37:27'),
(2, 'bb', '$2b$10$v.7Y.3ANT77aLydsk10YjuIo6SqoIJxePCXxSH4iG86n7l6txF6mO', 'bb@gmail.com', 'user', '2024-09-30 06:58:44', '2024-09-30 06:58:44'),
(3, '301', '$2b$10$mGnXfJTsY8BvGm68N2qw2.S0WkBNW10CesEVqMtQX6/Mzsu788rAq', '65160251@go.buu.ac.th', 'user', '2024-09-30 18:12:54', '2024-09-30 18:12:54'),
(4, 'root', 'root', 'root@gmail.com', 'staff', '2024-09-30 18:13:38', '2024-09-30 18:13:38'),
(5, 'ss', '$2b$10$jgWWSTsukLOfDtHJWLWz1eTEm1WWJ69b0cU9ReNi./OLXVRdTwOO2', 'ss@gmail.com', 'staff', '2024-09-30 18:21:02', '2024-09-30 18:21:02');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `knowledge_base`
--
ALTER TABLE `knowledge_base`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `queues`
--
ALTER TABLE `queues`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticketId` (`ticketId`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `userId` (`userId`),
  ADD KEY `fk_queue_id` (`queue_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `knowledge_base`
--
ALTER TABLE `knowledge_base`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `queues`
--
ALTER TABLE `queues`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `queues`
--
ALTER TABLE `queues`
  ADD CONSTRAINT `queues_ibfk_1` FOREIGN KEY (`ticketId`) REFERENCES `tickets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `fk_queue_id` FOREIGN KEY (`queue_id`) REFERENCES `queues` (`id`),
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
