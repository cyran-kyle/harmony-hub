-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 12, 2025 at 12:06 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `harmonyhub_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `coach_id` varchar(255) NOT NULL,
  `learner_id` varchar(255) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` varchar(255) NOT NULL,
  `participant1_id` varchar(255) NOT NULL,
  `participant2_id` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `last_message_at` datetime DEFAULT current_timestamp(),
  `messages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`messages`)),
  `unread_by_participant1` int(11) DEFAULT 0,
  `unread_by_participant2` int(11) DEFAULT 0,
  `last_message_text` text DEFAULT NULL,
  `last_message_sender` varchar(255) DEFAULT NULL,
  `unread_count_p1` int(11) DEFAULT 0,
  `unread_count_p2` int(11) DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`id`, `participant1_id`, `participant2_id`, `created_at`, `last_message_at`, `messages`, `unread_by_participant1`, `unread_by_participant2`, `last_message_text`, `last_message_sender`, `unread_count_p1`, `unread_count_p2`, `updated_at`) VALUES
('user_686fcce56f14f_user_686fcd6281e03', 'user_686fcce56f14f', 'user_686fcd6281e03', '2025-07-10 14:28:23', '2025-07-10 20:46:35', '[{\"senderId\":\"user_686fcce56f14f\",\"text\":\"hi\",\"timestamp\":\"2025-07-10 16:28:23\"},{\"senderId\":\"user_686fcce56f14f\",\"text\":\"hello\",\"timestamp\":\"2025-07-10 22:20:59\"},{\"senderId\":\"user_686fcd6281e03\",\"text\":\"how are you\",\"timestamp\":\"2025-07-10 22:21:47\"},{\"senderId\":\"user_686fcce56f14f\",\"text\":\"test\",\"timestamp\":\"2025-07-10 22:46:18\"},{\"senderId\":\"user_686fcd6281e03\",\"text\":\"test2\",\"timestamp\":\"2025-07-10 22:46:35\"}]', 0, 0, 'test2', 'user_686fcd6281e03', 0, 0, '2025-07-10 20:46:35');

-- --------------------------------------------------------

--
-- Table structure for table `coaches`
--

CREATE TABLE `coaches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `instrument` varchar(100) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `coaches`
--

INSERT INTO `coaches` (`id`, `name`, `instrument`, `genre`, `location`, `bio`, `photo_url`, `phone`) VALUES
('user_686fcd6281e03', 'kyle tech', 'Guitar', 'Gospel', 'Tamale', 'No bio yet.', 'https://placehold.co/150x150/E0E0E0/333333?text=ky', '+233596371001');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `coach_id` varchar(255) NOT NULL,
  `reviewer_id` varchar(255) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('learner','coach') NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `role`, `created_at`) VALUES
('user_686fcce56f14f', 'cyranx.it@gmail.com', '$2y$10$YUXmMwpBvq85gOXO2yC4X.UKNIK2.uyNFOhblsEpRnK8qiikOE7EK', 'learner', '2025-07-10 14:23:33'),
('user_686fcd6281e03', 'cyrankyle.it@gmail.com', '$2y$10$lTy8k5x/UGycTA30k1kat.JczF6NAMzkNHN.0VnPTyFpVPj1puZIG', 'coach', '2025-07-10 14:25:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coach_id` (`coach_id`),
  ADD KEY `learner_id` (`learner_id`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coaches`
--
ALTER TABLE `coaches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `coach_id` (`coach_id`),
  ADD KEY `reviewer_id` (`reviewer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`learner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `coaches`
--
ALTER TABLE `coaches`
  ADD CONSTRAINT `coaches_ibfk_1` FOREIGN KEY (`id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `coaches` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
