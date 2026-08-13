-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 10, 2026 at 12:50 PM
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
-- Database: `hrms6`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `name`, `password`) VALUES
(1, 'admin', 'admin123');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `priority` enum('Low','Normal','Medium','High') DEFAULT 'Normal',
  `scheduleDate` date DEFAULT NULL,
  `department` varchar(255) DEFAULT 'All',
  `attachment` varchar(255) DEFAULT NULL,
  `history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`history`)),
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `priority`, `scheduleDate`, `department`, `attachment`, `history`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'anouncement', 'anouncement', 'Medium', '2026-07-09', 'IT', 'pdf', '[\"Created on 7/9/2026\"]', 1, '2026-07-09 11:31:39', '2026-07-09 11:31:39'),
(3, 'hello', 'hello', 'Medium', '2026-07-09', 'Sales', 'pdf', '[\"Created on 7/9/2026\"]', 1, '2026-07-09 11:32:00', '2026-07-09 11:32:00'),
(5, 'birthday', 'happy birthday', 'Normal', '2026-08-02', 'Sales', 'ss', '[\"Created on 7/14/2026\"]', 1, '2026-07-14 08:26:59', '2026-07-14 08:26:59'),
(6, 'jjj', 'jjj', 'Medium', '2026-08-06', 'All', 'pdf', '[\"Created on 8/6/2026\"]', 1, '2026-08-06 06:00:02', '2026-08-06 06:00:02'),
(7, 'hh', 'hhh', 'Medium', '2026-08-06', 'All', 'hh', '[\"Created on 8/6/2026\"]', 1, '2026-08-06 06:00:58', '2026-08-06 06:00:58'),
(8, 'nnn', 'nnn', 'Medium', '2026-08-06', 'IT', 'pdf', '[\"Created on 8/6/2026\"]', 1, '2026-08-06 06:01:29', '2026-08-06 06:01:29'),
(9, 'rfr', 'retf', 'Normal', '2026-08-07', 'All', 'ret', '[\"Created on 8/7/2026\"]', 1, '2026-08-07 05:57:12', '2026-08-07 05:57:12');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `emp_id` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) DEFAULT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  `year` int(11) DEFAULT NULL,
  `month` int(11) DEFAULT NULL,
  `day` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `attendance_status` varchar(50) DEFAULT NULL,
  `mode` varchar(50) DEFAULT NULL,
  `lat` decimal(10,7) DEFAULT NULL,
  `lon` decimal(10,7) DEFAULT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `late_fine` decimal(10,2) DEFAULT 0.00,
  `final_salary` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `emp_id`, `student_id`, `employee_name`, `date`, `year`, `month`, `day`, `status`, `attendance_status`, `mode`, `lat`, `lon`, `check_in`, `check_out`, `late_fine`, `final_salary`, `created_at`, `updated_at`) VALUES
(1, 69, '69', '69', 'mahak', '2026-07-20', 2026, 7, 'Monday', 'HALF_DAY', 'HALF_DAY', 'Manual', NULL, NULL, '14:28:35', '14:28:38', 200.00, 2107.69, '2026-07-20 08:58:35', '2026-07-20 08:58:38'),
(2, 61, '61', '61', 'rashi', '2026-07-22', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'GPS', 22.7447657, 77.7205247, NULL, '11:35:59', 0.00, 1923.08, '2026-07-22 06:05:59', '2026-07-22 06:05:59'),
(3, 70, '70', '70', 'dipika', '2026-07-22', 2026, 7, 'Wednesday', 'LATE', 'LATE', 'Manual', NULL, NULL, '15:56:30', NULL, 100.00, 0.00, '2026-07-22 10:26:30', '2026-07-22 10:26:30'),
(4, 72, '72', '72', 'rina', '2026-07-24', 2026, 7, 'Friday', 'LATE', 'LATE', 'Manual', NULL, NULL, '12:21:38', NULL, 100.00, 0.00, '2026-07-24 06:51:38', '2026-07-24 06:51:38'),
(5, 72, '72', '72', 'rina', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '12:21:45', 0.00, 2692.19, '2026-07-24 06:51:45', '2026-07-24 06:51:45'),
(6, 72, '72', '72', 'rina', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '12:21:49', 0.00, 2692.19, '2026-07-24 06:51:49', '2026-07-24 06:51:49'),
(7, 70, '70', '70', 'dipika', '2026-07-21', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '12:21:54', 0.00, 769.23, '2026-07-24 06:51:54', '2026-07-24 06:51:54'),
(8, 70, '70', '70', 'dipika', '2026-07-21', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '12:21:57', 0.00, 769.23, '2026-07-24 06:51:57', '2026-07-24 06:51:57'),
(9, 70, '70', '70', 'dipika', '2026-07-21', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '12:22:05', 0.00, 769.23, '2026-07-24 06:52:05', '2026-07-24 06:52:05'),
(10, 73, '73', '73', 'yashi', '2026-07-24', 2026, 7, 'Friday', 'HALF_DAY', 'HALF_DAY', 'GPS', 22.7448260, 77.7205625, '13:38:52', '13:40:58', 200.00, 3261.54, '2026-07-24 08:08:52', '2026-07-24 08:10:58'),
(11, 70, '70', '70', 'dipika', '2026-07-21', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:39:16', 0.00, 769.23, '2026-07-24 08:09:16', '2026-07-24 08:09:16'),
(12, 70, '70', '70', 'dipika', '2026-07-21', 2026, 7, 'Wednesday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:39:20', 0.00, 769.23, '2026-07-24 08:09:20', '2026-07-24 08:09:20'),
(13, 54, '54', '54', 'Tanishka gupta', '2026-07-24', 2026, 7, 'Friday', 'LATE', 'LATE', 'Manual', NULL, NULL, '13:41:35', NULL, 100.00, 0.00, '2026-07-24 08:11:35', '2026-07-24 08:11:35'),
(14, 54, '54', '54', 'Tanishka gupta', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:41:40', 0.00, 769.23, '2026-07-24 08:11:40', '2026-07-24 08:11:40'),
(15, 54, '54', '54', 'Tanishka gupta', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:41:43', 0.00, 769.23, '2026-07-24 08:11:43', '2026-07-24 08:11:43'),
(16, 54, '54', '54', 'Tanishka gupta', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:41:49', 0.00, 769.23, '2026-07-24 08:11:49', '2026-07-24 08:11:49'),
(17, 54, '54', '54', 'Tanishka gupta', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:41:54', 0.00, 769.23, '2026-07-24 08:11:54', '2026-07-24 08:11:54'),
(18, 63, '63', '63', 'manu', '2026-07-24', 2026, 7, 'Friday', 'LATE', 'LATE', 'Manual', NULL, NULL, '13:42:04', NULL, 100.00, 0.00, '2026-07-24 08:12:04', '2026-07-24 08:12:04'),
(19, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:42:13', 0.00, 1153.77, '2026-07-24 08:12:13', '2026-07-24 08:12:13'),
(20, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '13:43:24', 0.00, 1153.77, '2026-07-24 08:13:24', '2026-07-24 08:13:24'),
(21, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:10:07', 0.00, 1153.77, '2026-07-24 08:40:07', '2026-07-24 08:40:07'),
(22, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:10:10', 0.00, 1153.77, '2026-07-24 08:40:10', '2026-07-24 08:40:10'),
(23, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:38:17', 0.00, 1153.77, '2026-07-24 09:08:18', '2026-07-24 09:08:17'),
(24, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:38:21', 0.00, 1153.77, '2026-07-24 09:08:21', '2026-07-24 09:08:21'),
(25, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:47:37', 0.00, 1153.77, '2026-07-24 09:17:37', '2026-07-24 09:17:37'),
(26, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:57:32', 0.00, 1153.77, '2026-07-24 09:27:32', '2026-07-24 09:27:32'),
(27, 63, '63', '63', 'manu', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '14:57:36', 0.00, 1153.77, '2026-07-24 09:27:36', '2026-07-24 09:27:36'),
(28, 75, '75', '75', 'rashi', '2026-07-24', 2026, 7, 'Friday', 'HALF_DAY', 'HALF_DAY', 'Manual', NULL, NULL, '15:01:08', '15:16:36', 200.00, 1723.08, '2026-07-24 09:31:08', '2026-07-24 09:46:36'),
(29, 75, '75', '75', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:01:45', 0.00, 1923.08, '2026-07-24 09:31:45', '2026-07-24 09:31:45'),
(30, 75, '75', '75', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:01:50', 0.00, 1923.08, '2026-07-24 09:31:50', '2026-07-24 09:31:50'),
(31, 75, '75', '75', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:01:58', 0.00, 1923.08, '2026-07-24 09:31:58', '2026-07-24 09:31:58'),
(32, 76, '76', '76', 'rashi', '2026-07-24', 2026, 7, 'Friday', 'LATE', 'LATE', 'Manual', NULL, NULL, '15:18:53', NULL, 100.00, 0.00, '2026-07-24 09:48:53', '2026-07-24 09:48:53'),
(33, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:58:13', 0.00, 2307.69, '2026-07-24 10:28:13', '2026-07-24 10:28:13'),
(34, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:58:17', 0.00, 2307.69, '2026-07-24 10:28:17', '2026-07-24 10:28:17'),
(35, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '15:58:22', 0.00, 2307.69, '2026-07-24 10:28:22', '2026-07-24 10:28:22'),
(36, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '16:08:33', 0.00, 2307.69, '2026-07-24 10:38:33', '2026-07-24 10:38:33'),
(37, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '10:42:24', 0.00, 2307.69, '2026-07-25 05:12:24', '2026-07-25 05:12:24'),
(38, 76, '76', '76', 'rashi', '2026-07-23', 2026, 7, 'Friday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '10:43:05', 0.00, 2307.69, '2026-07-25 05:13:05', '2026-07-25 05:13:05'),
(39, 70, '70', '70', 'dipika', '2026-07-25', 2026, 7, 'Saturday', 'OUT', 'OUT', 'Manual', NULL, NULL, NULL, '10:46:12', 0.00, 769.23, '2026-07-25 05:16:12', '2026-07-25 05:16:12'),
(40, 54, '54', '54', 'Tanishka gupta', '2026-07-25', 2026, 7, 'Saturday', 'LATE', 'LATE', 'Manual', NULL, NULL, '10:46:40', NULL, 100.00, 0.00, '2026-07-25 05:16:40', '2026-07-25 05:16:40'),
(41, 75, '75', '75', 'rashi', '2026-07-25', 2026, 7, 'Saturday', 'HALF_DAY', 'HALF_DAY', 'Biometric', NULL, NULL, '13:36:53', '13:36:57', 200.00, 1723.08, '2026-07-25 08:06:53', '2026-07-25 08:06:57'),
(42, 73, '73', '73', 'yashi', '2026-07-25', 2026, 7, 'Saturday', 'LATE', 'LATE', 'Biometric', NULL, NULL, '13:37:34', NULL, 100.00, 0.00, '2026-07-25 08:07:34', '2026-07-25 08:07:34');

-- --------------------------------------------------------

--
-- Table structure for table `certificates`
--

CREATE TABLE `certificates` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `recipient_name` varchar(100) NOT NULL,
  `recipient_email` varchar(100) NOT NULL,
  `certificate_type_id` int(11) DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificates`
--

INSERT INTO `certificates` (`id`, `employee_id`, `recipient_name`, `recipient_email`, `certificate_type_id`, `issued_date`, `expiry_date`, `status`, `file_path`) VALUES
(1, NULL, 'Test User', 'testuser@example.com', 1, '2026-07-22', NULL, 'sent', 'uploads/test.pdf'),
(2, 73, 'yashi', 'missg3734@gmail.com', 2, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784711242894.pdf'),
(3, NULL, 'gupta', 'guptarashii777@gmail.com', 3, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784711800352.pdf'),
(4, 73, 'yashi', 'missg3734@gmail.com', 2, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784712733898.pdf'),
(5, 73, 'yashi', 'missg3734@gmail.com', 4, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784713672981.pdf'),
(6, 73, 'yashi', 'missg3734@gmail.com', 2, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784714347265.pdf'),
(7, 73, 'yashi', 'missg3734@gmail.com', 5, '2026-07-22', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784714788646.pdf'),
(8, 77, 'veer', 'veerendrarajput08@gmail.com', 5, '2026-07-25', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1784977116855.pdf'),
(9, 73, 'yashi', 'missg3734@gmail.com', 6, '2026-07-27', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785142803225.pdf'),
(10, 79, 'ambika', 'ruchitiwari5757@gmail.com', 2, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785221785441.pdf'),
(11, 73, 'Tanishka gupta', 'missg3734@gmail.com', 4, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785222301495.pdf'),
(12, 79, 'ambika', 'ruchitiwari5757@gmail.com', 6, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785226804155.pdf'),
(13, 79, 'ambika', 'ruchitiwari5757@gmail.com', 2, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785227376418.pdf'),
(14, 79, 'ambika', 'ruchitiwari5757@gmail.com', 2, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785227614360.pdf'),
(15, 79, 'ambika', 'ruchitiwari5757@gmail.com', 6, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785228392332.pdf'),
(16, 79, 'ambika', 'ruchitiwari5757@gmail.com', 2, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785230083977.pdf'),
(17, 79, 'ambika', 'ruchitiwari5757@gmail.com', 6, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785230299026.pdf'),
(18, 79, 'ambika', 'ruchitiwari5757@gmail.com', 4, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785230784942.pdf'),
(19, 79, 'ambika', 'ruchitiwari5757@gmail.com', 6, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785230874426.pdf'),
(20, 79, 'ambika', 'ruchitiwari5757@gmail.com', 4, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785232106732.pdf'),
(21, 79, 'ambika', 'ruchitiwari5757@gmail.com', 4, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785232166427.pdf'),
(22, 79, 'ambika', 'ruchitiwari5757@gmail.com', 6, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785232460892.pdf'),
(23, 80, 'payal ', 'ambikamalviya511@gmail.com', 2, '2026-07-28', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785234979033.pdf'),
(24, 79, 'ambika', 'ruchitiwari5757@gmail.com', 2, '2026-07-30', NULL, 'sent', 'C:\\Users\\hhh\\OneDrive\\Desktop\\HR finnal\\backend1111\\backend91\\backend99\\backend96\\backend\\uploads\\certificate_1785390691000.pdf'),
(25, 73, 'yashi', 'missg3734@gmail.com', 6, '2026-08-10', NULL, 'sent', 'C:\\Users\\Z\\Desktop\\NEW HR\\backend6\\backend\\uploads\\certificate_1786356392806.pdf'),
(26, 83, 'teena', 'krishnamg019@gmail.com', 3, '2026-08-10', NULL, 'sent', 'C:\\Users\\Z\\Desktop\\NEW HR\\backend6\\backend\\uploads\\certificate_1786356678524.pdf');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_types`
--

CREATE TABLE `certificate_types` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_types`
--

INSERT INTO `certificate_types` (`id`, `name`, `description`) VALUES
(1, 'Training Completion', 'Auto-created'),
(2, 'achievement', NULL),
(3, 'excellence', NULL),
(4, 'training', NULL),
(5, 'course', NULL),
(6, 'participation', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_groups`
--

CREATE TABLE `chat_groups` (
  `id` int(11) NOT NULL,
  `room` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `members` text NOT NULL,
  `created_by` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_groups`
--

INSERT INTO `chat_groups` (`id`, `room`, `name`, `members`, `created_by`, `created_at`) VALUES
(1, 'group_as_group', 'AS Group', '[\"54\",\"56\",\"57\",\"58\",\"73\",\"admin\"]', 'admin', '2026-07-24 07:11:51'),
(2, 'group_new', 'new', '[\"70\",\"76\",\"77\",\"63\",\"admin\"]', 'admin', '2026-07-25 10:57:49'),
(3, 'group_as_group_digital_private_limited', 'AS Group Digital Private Limited', '[\"54\",\"82\",\"80\",\"79\",\"admin\"]', 'admin', '2026-08-07 05:58:53');

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` int(11) NOT NULL,
  `room` varchar(255) NOT NULL,
  `sender_id` varchar(255) DEFAULT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `sender_role` varchar(50) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `room`, `sender_id`, `sender_name`, `sender_role`, `message`, `created_at`) VALUES
(1, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:23'),
(2, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:23'),
(3, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:31'),
(4, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:31'),
(5, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:38'),
(6, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:38'),
(7, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:43'),
(8, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 08:33:43'),
(9, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 08:49:57'),
(10, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 08:49:57'),
(11, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 08:50:01'),
(12, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 08:50:01'),
(13, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 09:03:58'),
(14, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hy', '2026-07-03 09:03:58'),
(15, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyy', '2026-07-03 09:12:41'),
(16, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyy', '2026-07-03 09:12:41'),
(17, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyyy', '2026-07-03 09:12:48'),
(18, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyyy', '2026-07-03 09:12:48'),
(19, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyyyyy', '2026-07-03 09:12:52'),
(20, 'chat_admin_employee1', 'admin', 'admin', 'admin', 'hyyyyy', '2026-07-03 09:12:52'),
(21, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 09:16:48'),
(22, 'chat_admin_employee1', 'employee1', 'employee1', 'employee', 'hy', '2026-07-03 09:16:48'),
(23, 'chat_5_admin', '5', '5', 'admin', 'hy', '2026-07-03 09:55:51'),
(24, 'chat_5_admin', '5', '5', 'admin', 'hy', '2026-07-03 09:55:51'),
(25, 'chat_1_employee1', '1', '1', 'admin', 'hy', '2026-07-03 10:12:15'),
(26, 'chat_1_employee1', '1', '1', 'admin', 'hy', '2026-07-03 10:12:15'),
(27, 'chat_1_employee1', '1', '1', 'admin', 'hyy', '2026-07-03 10:12:21'),
(28, 'chat_1_employee1', '1', '1', 'admin', 'hyy', '2026-07-03 10:12:21'),
(29, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-03 10:12:52'),
(30, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-03 10:12:52'),
(31, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-03 10:12:57'),
(32, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-03 10:12:57'),
(33, 'chat_39_admin', '39', '39', 'employee', 'hy kese ho aap', '2026-07-03 10:13:09'),
(34, 'chat_39_admin', '39', '39', 'employee', 'hy kese ho aap', '2026-07-03 10:13:09'),
(35, 'chat_1_employee1', '1', '1', 'admin', 'hy', '2026-07-03 10:16:35'),
(36, 'chat_1_employee1', '1', '1', 'admin', 'hyy', '2026-07-03 10:16:42'),
(37, 'chat_1_employee1', '1', '1', 'admin', 'hyy', '2026-07-03 10:16:46'),
(38, 'chat_1_employee1', '1', '1', 'admin', 'hyy', '2026-07-03 10:17:31'),
(39, 'chat_1_employee', '1', '1', 'admin', 'hyy', '2026-07-03 10:17:40'),
(40, 'chat_1_employee', '1', '1', 'admin', 'hyy', '2026-07-03 10:17:40'),
(41, 'chat_39_admin', '39', '39', 'employee', 'hu', '2026-07-03 10:18:14'),
(42, 'chat_39_admin', '39', '39', 'employee', 'hu', '2026-07-03 10:18:15'),
(43, 'chat_1_employee', '1', '1', 'admin', 'hyyy', '2026-07-03 10:18:25'),
(44, 'chat_1_employee', '1', '1', 'admin', 'hyyy', '2026-07-03 10:18:25'),
(45, 'chat_1_employee', '1', '1', 'admin', 'huuuu', '2026-07-03 10:23:11'),
(46, 'chat_1_employee', '1', '1', 'admin', 'huuuu', '2026-07-03 10:23:11'),
(47, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:24:36'),
(48, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:24:36'),
(49, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:28:41'),
(50, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:28:41'),
(51, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:28:48'),
(52, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:28:48'),
(53, 'chat_1_employee', '1', '1', 'admin', 'hyy', '2026-07-03 10:31:04'),
(54, 'chat_1_employee', '1', '1', 'admin', 'hyy', '2026-07-03 10:31:04'),
(55, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:31:11'),
(56, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:31:11'),
(57, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:33:24'),
(58, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:33:59'),
(59, 'chat_39_admin', '39', '39', 'employee', 'hyyyy', '2026-07-03 10:36:02'),
(60, 'chat_39_admin', '39', '39', 'employee', 'huuuu', '2026-07-03 10:36:28'),
(61, 'chat_39_admin', '39', '39', 'employee', 'haa', '2026-07-03 10:36:35'),
(62, 'chat_1_employee', '1', '1', 'admin', 'hyyy', '2026-07-03 10:38:00'),
(63, 'chat_1_employee', '1', '1', 'admin', 'hyyy', '2026-07-03 10:38:00'),
(64, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-03 10:39:04'),
(65, 'chat_39_admin', '39', '39', 'employee', 'hhuuu', '2026-07-03 10:41:00'),
(66, 'chat_39_admin', '39', '39', 'employee', 'hhuuu', '2026-07-03 10:41:00'),
(67, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:43:45'),
(68, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:43:45'),
(69, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-03 10:44:12'),
(70, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-03 10:44:12'),
(71, 'chat_39_admin', '39', '39', 'employee', 'hhiii', '2026-07-03 10:47:59'),
(72, 'chat_39_admin', '39', '39', 'employee', 'hhiii', '2026-07-03 10:47:59'),
(73, 'chat_1_employee', '1', '1', 'admin', 'hyyyyy', '2026-07-03 10:48:34'),
(74, 'chat_1_employee', '1', '1', 'admin', 'hyyyyy', '2026-07-03 10:48:34'),
(75, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:55:46'),
(76, 'chat_39_admin', '39', '39', 'employee', 'hyyy', '2026-07-03 10:55:47'),
(77, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:55:52'),
(78, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:55:52'),
(79, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:56:07'),
(80, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:56:07'),
(81, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:56:34'),
(82, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-03 10:56:34'),
(83, 'chat_1_employee', '1', '1', 'admin', 'ji', '2026-07-03 11:10:10'),
(84, 'chat_1_employee', '1', '1', 'admin', 'ji', '2026-07-03 11:10:10'),
(85, 'chat_1_employee', '1', '1', 'admin', 'huiii', '2026-07-03 11:12:27'),
(86, 'chat_1_employee', '1', '1', 'admin', 'huiii', '2026-07-03 11:12:27'),
(87, 'chat_1_employee', '1', '1', 'admin', 'haaaa bolo', '2026-07-03 11:12:37'),
(88, 'chat_1_employee', '1', '1', 'admin', 'haaaa bolo', '2026-07-03 11:12:37'),
(89, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-04 05:47:50'),
(90, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-04 05:47:50'),
(91, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-04 05:52:30'),
(92, 'chat_1_employee', '1', '1', 'admin', 'hy', '2026-07-04 05:52:30'),
(93, 'chat_1_31', '1', '1', 'admin', 'hy', '2026-07-04 06:40:30'),
(94, 'chat_1_31', '1', '1', 'admin', 'hy', '2026-07-04 06:40:30'),
(95, 'chat_1_39', '1', '1', 'admin', 'hy', '2026-07-04 06:41:15'),
(96, 'chat_1_39', '1', '1', 'admin', 'hy', '2026-07-04 06:41:15'),
(97, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-04 06:46:16'),
(98, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-04 06:46:16'),
(99, 'chat_1_39', '1', '1', 'admin', 'hy', '2026-07-04 06:46:51'),
(100, 'chat_1_39', '1', '1', 'admin', 'hy', '2026-07-04 06:46:51'),
(101, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-04 06:47:03'),
(102, 'chat_39_admin', '39', '39', 'employee', 'hyy', '2026-07-04 06:47:03'),
(103, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 06:50:29'),
(104, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 06:50:29'),
(105, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 06:50:38'),
(106, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 06:50:38'),
(107, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 06:51:47'),
(108, 'chat_39_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 06:51:47'),
(109, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-04 06:52:04'),
(110, 'chat_39_admin', '39', '39', 'employee', 'hy', '2026-07-04 06:52:04'),
(111, 'chat_39_admin', '39', 'Gupta', 'employee', 'hyy', '2026-07-04 06:59:07'),
(112, 'chat_39_admin', '39', 'Gupta', 'employee', 'hyy', '2026-07-04 06:59:07'),
(113, 'chat_39_admin', '39', 'Gupta', 'employee', 'hyy', '2026-07-04 06:59:14'),
(114, 'chat_39_admin', '39', 'Gupta', 'employee', 'hyy', '2026-07-04 06:59:14'),
(115, 'chat_39_admin', 'admin', 'admin', 'admin', 'hello', '2026-07-04 06:59:47'),
(116, 'chat_39_admin', 'admin', 'admin', 'admin', 'hello', '2026-07-04 06:59:47'),
(117, 'chat_1_39', '39', 'Gupta', 'employee', 'hy', '2026-07-04 07:15:38'),
(118, 'chat_1_39', '39', 'Gupta', 'employee', 'hy', '2026-07-04 07:15:38'),
(119, 'chat_39_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 07:16:37'),
(120, 'chat_39_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 07:16:37'),
(121, 'chat_1_39', '39', 'Gupta', 'employee', 'hyyy', '2026-07-04 07:16:54'),
(122, 'chat_1_39', '39', 'Gupta', 'employee', 'hyyy', '2026-07-04 07:16:54'),
(123, 'chat_6_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 07:24:00'),
(124, 'chat_6_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 07:24:00'),
(125, 'chat_6_admin', '6', 'Anurag Sharma', 'employee', 'hyy', '2026-07-04 07:24:38'),
(126, 'chat_6_admin', '6', 'Anurag Sharma', 'employee', 'hyy', '2026-07-04 07:24:38'),
(127, 'chat_6_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 07:24:58'),
(128, 'chat_6_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 07:24:58'),
(129, 'chat_6_admin', '6', 'Anurag Sharma', 'employee', 'hyyy', '2026-07-04 07:25:12'),
(130, 'chat_6_admin', '6', 'Anurag Sharma', 'employee', 'hyyy', '2026-07-04 07:25:12'),
(131, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy shikha', '2026-07-04 08:19:40'),
(132, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy shikha', '2026-07-04 08:19:40'),
(133, 'chat_1_14', '14', 'shikha', 'employee', 'hy', '2026-07-04 08:20:43'),
(134, 'chat_1_14', '14', 'shikha', 'employee', 'hy', '2026-07-04 08:20:44'),
(135, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:20:54'),
(136, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:20:54'),
(137, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:21:17'),
(138, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:21:17'),
(139, 'chat_1_14', '14', 'shikha', 'employee', 'hy', '2026-07-04 08:21:33'),
(140, 'chat_1_14', '14', 'shikha', 'employee', 'hy', '2026-07-04 08:21:33'),
(141, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:25:07'),
(142, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:25:07'),
(143, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:25:23'),
(144, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:25:23'),
(145, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:25:53'),
(146, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:25:53'),
(147, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 08:26:07'),
(148, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 08:26:07'),
(149, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 08:29:57'),
(150, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 08:29:57'),
(151, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:30:15'),
(152, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:30:15'),
(153, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:41:30'),
(154, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:41:30'),
(155, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:44:49'),
(156, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 08:44:49'),
(157, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:47:48'),
(158, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:47:48'),
(159, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:47:55'),
(160, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:47:55'),
(161, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyyy', '2026-07-04 08:51:21'),
(162, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyyy', '2026-07-04 08:51:21'),
(163, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:51:39'),
(164, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:51:39'),
(165, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:59:00'),
(166, 'chat_1_14', '14', 'shikha', 'employee', 'hyy', '2026-07-04 08:59:00'),
(167, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:59:32'),
(168, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 08:59:32'),
(169, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:09:09'),
(170, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:09:09'),
(171, 'chat_14_admin', 'admin', 'admin', 'admin', 'hiiiiii', '2026-07-04 09:10:48'),
(172, 'chat_14_admin', 'admin', 'admin', 'admin', 'hiiiiii', '2026-07-04 09:10:48'),
(173, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 09:14:39'),
(174, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 09:14:39'),
(175, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:14:50'),
(176, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:14:50'),
(177, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 09:15:25'),
(178, 'chat_1_14', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 09:15:25'),
(179, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 09:18:35'),
(180, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 09:18:35'),
(181, 'chat_14_admin', '14', 'shikha', 'employee', 'hy', '2026-07-04 09:19:00'),
(182, 'chat_14_admin', '14', 'shikha', 'employee', 'hy', '2026-07-04 09:19:00'),
(183, 'chat_14_admin', '14', 'shikha', 'employee', 'hyyyy', '2026-07-04 09:19:28'),
(184, 'chat_14_admin', '14', 'shikha', 'employee', 'hyyyy', '2026-07-04 09:19:28'),
(185, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:19:45'),
(186, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 09:19:45'),
(187, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 09:36:45'),
(188, 'chat_14_admin', '14', 'shikha', 'employee', 'hy', '2026-07-04 09:37:04'),
(189, 'chat_14_admin', '14', 'shikha', 'employee', 'hello', '2026-07-04 09:37:14'),
(190, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 09:39:38'),
(191, 'chat_14_admin', '14', 'shikha', 'employee', 'hyy', '2026-07-04 09:39:50'),
(192, 'chat_14_admin', '14', 'shikha', 'employee', 'hy', '2026-07-04 09:41:13'),
(193, 'chat_14_admin', '14', 'shikha', 'employee', 'ji', '2026-07-04 09:41:19'),
(194, 'chat_14_admin', 'admin', 'admin', 'admin', 'hello', '2026-07-04 09:41:51'),
(195, 'chat_14_admin', '14', 'shikha', 'employee', 'hy', '2026-07-04 09:46:24'),
(196, 'chat_14_admin', '14', 'shikha', 'employee', 'hyy', '2026-07-04 09:46:39'),
(197, 'chat_14_admin', '14', 'shikha', 'employee', 'ggyyy', '2026-07-04 09:49:59'),
(198, 'chat_14_admin', 'admin', 'admin', 'admin', 'hloo', '2026-07-04 09:55:45'),
(199, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 10:02:51'),
(200, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 10:03:01'),
(201, 'chat_14_admin', '14', 'shikha', 'employee', 'hyy', '2026-07-04 10:03:43'),
(202, 'chat_14_admin', 'admin', 'admin', 'admin', 'ha', '2026-07-04 10:03:52'),
(203, 'chat_14_admin', '14', 'shikha', 'employee', 'aa', '2026-07-04 10:04:01'),
(204, 'chat_14_admin', 'admin', 'admin', 'admin', 'aa rhi hu', '2026-07-04 10:04:10'),
(205, 'chat_14_admin', '14', 'shikha', 'employee', 'hii', '2026-07-04 10:05:11'),
(206, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 10:05:41'),
(207, 'chat_14_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-04 10:13:32'),
(208, 'chat_14_admin', '14', 'shikha', 'employee', 'hiiii', '2026-07-04 11:00:06'),
(209, 'chat_10_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-04 11:29:12'),
(210, 'chat_10_admin', 'admin', 'admin', 'admin', 'hello', '2026-07-04 11:29:18'),
(211, 'chat_10_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 11:29:22'),
(212, 'chat_10_admin', 'admin', 'admin', 'admin', 'kyaa kar rhi ho', '2026-07-04 11:29:34'),
(213, 'chat_14_admin', '14', 'shikha', 'employee', 'hyyy', '2026-07-04 11:30:10'),
(214, 'chat_14_admin', '14', 'shikha', 'employee', 'h r u', '2026-07-04 11:30:17'),
(215, 'chat_14_admin', '14', 'shikha', 'employee', 'haa', '2026-07-04 11:38:39'),
(216, 'chat_10_admin', '10', 'nehaa', 'employee', 'hy', '2026-07-04 11:48:03'),
(217, 'chat_10_admin', 'admin', 'admin', 'admin', 'haa', '2026-07-04 11:48:20'),
(218, 'chat_10_admin', '10', 'nehaa', 'employee', 'hyyyy', '2026-07-04 11:50:25'),
(219, 'chat_10_admin', 'admin', 'admin', 'admin', 'ji', '2026-07-04 11:50:38'),
(220, 'chat_10_admin', 'admin', 'admin', 'admin', 'haaa', '2026-07-04 11:50:43'),
(221, 'chat_10_admin', '10', 'nehaa', 'employee', 'bolo', '2026-07-04 11:50:53'),
(222, 'chat_10_admin', '10', 'nehaa', 'employee', 'btaoo', '2026-07-04 11:51:09'),
(223, 'chat_10_admin', '10', 'nehaa', 'employee', 'hmmm', '2026-07-04 11:52:27'),
(224, 'chat_14_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-04 12:09:28'),
(225, 'chat_14_admin', 'admin', 'admin', 'admin', 'haaa', '2026-07-04 12:09:38'),
(226, 'chat_17_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-06 04:30:16'),
(227, 'chat_17_admin', '17', 'riya', 'employee', 'hy', '2026-07-06 04:34:26'),
(228, 'chat_17_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-06 04:34:45'),
(229, 'chat_17_admin', '17', 'riya', 'employee', 'hello', '2026-07-06 04:34:55'),
(230, 'chat_17_admin', 'admin', 'admin', 'admin', 'haa bolo', '2026-07-06 04:35:06'),
(231, 'chat_17_admin', '17', 'riya', 'employee', 'haa btao', '2026-07-06 04:35:19'),
(232, 'chat_33_admin', 'admin', 'admin', 'admin', 'hy', '2026-07-06 06:19:22'),
(233, 'chat_33_admin', '33', 'tina', 'employee', 'haa', '2026-07-06 06:20:50'),
(234, 'chat_33_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-06 06:21:01'),
(235, 'chat_33_admin', '33', 'tina', 'employee', 'ha bolo btao', '2026-07-06 06:21:11'),
(236, 'chat_10_admin', '10', 'nehaa', 'employee', 'hyyyy', '2026-07-06 11:30:41'),
(237, 'chat_10_admin', '10', 'nehaa', 'employee', 'hyy', '2026-07-06 11:30:51'),
(238, 'chat_10_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-06 11:31:09'),
(239, 'chat_10_admin', '10', 'nehaa', 'employee', 'hyy', '2026-07-06 11:32:31'),
(240, 'chat_10_admin', '10', 'nehaa', 'employee', 'hyy', '2026-07-06 11:32:36'),
(241, 'chat_10_admin', 'admin', 'admin', 'admin', 'hyyy', '2026-07-06 11:34:33'),
(242, 'chat_10_admin', 'admin', 'admin', 'admin', 'kya kar rhe hoo', '2026-07-06 11:34:43'),
(243, 'chat_10_admin', '10', 'nehaa', 'employee', 'haaaaa', '2026-07-06 11:36:08'),
(244, 'chat_10_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-07 05:04:22'),
(245, 'chat_10_admin', '10', 'nehaa', 'employee', 'hello', '2026-07-07 11:05:41'),
(246, 'chat_10_admin', '10', 'nehaa', 'employee', 'kyaa kar rhi ho', '2026-07-07 11:05:49'),
(247, 'chat_10_admin', '10', 'nehaa', 'employee', 'bolo btao', '2026-07-07 11:05:55'),
(248, 'chat_8_admin', 'admin', 'admin', 'admin', 'hi', '2026-07-07 11:06:15'),
(249, 'chat_10_admin', '10', 'nehaa', 'employee', 'g', '2026-07-07 12:25:18'),
(250, 'chat_10_admin', '10', 'nehaa', 'employee', 'haa', '2026-07-07 12:25:58'),
(251, 'chat_10_admin', '10', 'nehaa', 'employee', 'haaa', '2026-07-07 12:26:20'),
(252, 'chat_10_admin', '10', 'nehaa', 'employee', 'bolo', '2026-07-07 12:26:27'),
(253, 'chat_39_admin', '39', 'Gupta', 'employee', 'hyyy', '2026-07-08 05:46:34'),
(254, 'chat_39_admin', '39', 'Gupta', 'employee', 'kese ho ho', '2026-07-08 05:46:43'),
(255, 'chat_39_admin', '39', 'Gupta', 'employee', 'ha', '2026-07-08 06:09:09'),
(256, 'chat_43_admin', '43', 'Ruchi Tiwari', 'employee', 'hy', '2026-07-08 12:10:51'),
(257, 'chat_43_admin', '43', 'Ruchi Tiwari', 'employee', 'ha bolo btao', '2026-07-08 12:18:10'),
(258, 'chat_51_admin', 'admin', 'admin', 'admin', 'hyy', '2026-07-10 05:40:23'),
(259, 'chat_51_admin', '51', 'sheetal', 'employee', 'hlo', '2026-07-10 05:41:13'),
(260, 'chat_50_admin', '50', 'yashi', 'employee', 'hii', '2026-07-10 10:50:17'),
(261, 'chat_51_admin', '51', 'sheetal', 'employee', 'hiiiiii', '2026-07-14 05:52:31'),
(262, 'chat_50_admin', '50', 'yashi', 'employee', 'hlo', '2026-07-14 08:19:51'),
(263, 'chat_1_admin', 'admin', 'admin', 'admin', 'hiii', '2026-07-15 06:01:40'),
(264, 'chat_50_admin', '50', 'yashi', 'employee', 'hlo', '2026-07-15 06:05:29'),
(265, 'chat_50_admin', 'admin', 'admin', 'admin', 'hii', '2026-07-15 11:15:01'),
(266, 'chat_54_admin', 'admin', 'admin', 'admin', 'hii', '2026-07-20 09:00:03'),
(267, 'chat_66_admin', 'admin', 'admin', 'admin', 'hiiiiiiiii', '2026-07-20 10:19:42'),
(268, 'chat_61_admin', '61', 'rashi', 'manager', 'hiii', '2026-07-22 06:05:17'),
(269, 'chat_67_admin', 'admin', 'admin', 'admin', 'hii', '2026-07-22 06:06:57'),
(270, 'chat_67_admin', 'admin', 'admin', 'admin', 'ji', '2026-07-22 06:07:26'),
(271, 'chat_70_admin', 'admin', 'admin', 'admin', 'hiii', '2026-07-22 06:07:46'),
(272, 'chat_70_admin', 'admin', 'admin', 'admin', 'kii', '2026-07-22 06:07:56'),
(273, 'chat_56_admin', 'admin', 'admin', 'admin', 'jiii', '2026-07-22 06:08:10'),
(274, 'chat_58_admin', 'admin', 'admin', 'admin', 'jiiiiiiii', '2026-07-22 06:08:23'),
(275, 'chat_58_admin', 'admin', 'admin', 'admin', 'kuuuu', '2026-07-22 06:08:33'),
(276, 'chat_64_admin', 'admin', 'admin', 'admin', 'hii', '2026-07-22 10:29:08'),
(277, 'chat_61_admin', '61', 'rashi', 'manager', 'hii', '2026-07-22 10:36:05'),
(278, 'group_as_group', 'admin', 'admin', 'admin', 'hii guyssss.............', '2026-07-24 07:12:18'),
(279, 'chat_63_70', '70', 'dipika', 'tl', 'hii', '2026-07-25 10:12:22'),
(280, 'chat_63_75', '63', 'manu', 'employee', 'hiii', '2026-07-25 10:41:56'),
(281, 'chat_73_group_as_group', '73', 'yashi', 'manager', 'hy', '2026-07-28 06:46:36'),
(282, 'group_as_group', '73', 'yashi', 'manager', 'hyy', '2026-07-28 08:59:13'),
(283, 'chat_81_admin', '81', 'Tanishka gupta', 'employee', 'hy', '2026-07-30 11:35:11'),
(284, 'chat_63_75', '63', 'manu', 'employee', 'hello', '2026-08-01 06:20:01'),
(285, 'chat_63_75', '63', 'manu', 'employee', 'hyyy', '2026-08-01 06:20:07'),
(286, 'group_new', 'admin', 'admin', 'admin', 'hyyyy', '2026-08-01 06:21:26'),
(287, 'group_new', 'admin', 'admin', 'admin', 'hello', '2026-08-01 06:21:33'),
(288, 'group_new', 'admin', 'admin', 'admin', 'kyaa kar rhe ho', '2026-08-01 06:21:42'),
(289, 'group_new', 'admin', 'admin', 'admin', 'btana', '2026-08-01 06:21:57'),
(290, 'chat_[object Object]_admin', 'admin', 'admin', 'admin', 'haaaa bolo btao', '2026-08-01 06:22:22'),
(291, 'chat_63_admin', 'admin', 'admin', 'admin', 'hello haa', '2026-08-01 06:24:03'),
(292, 'chat_63_77', '63', 'manu', 'employee', 'hyyyy', '2026-08-01 06:50:23'),
(293, 'chat_63_77', '63', 'manu', 'employee', 'heellooo', '2026-08-01 06:50:31'),
(294, 'chat_63_77', '63', 'manu', 'employee', 'bolo btao', '2026-08-01 06:50:40'),
(295, 'chat_63_80', '63', 'manu', 'employee', 'hyyy', '2026-08-01 07:00:25'),
(296, 'chat_63_73', '63', 'manu', 'employee', 'hyyy', '2026-08-01 07:00:44'),
(297, 'chat_63_73', '63', 'manu', 'employee', 'hy user', '2026-08-01 07:01:33'),
(298, 'chat_63_78', '63', 'manu', 'employee', 'hyy', '2026-08-01 07:07:12'),
(299, 'group_new', 'admin', 'admin', 'admin', 'hyyyy', '2026-08-01 08:46:16'),
(300, 'chat_54_admin', 'admin', 'admin', 'admin', 'huumm', '2026-08-01 09:26:10'),
(301, 'chat_78_admin', 'admin', 'admin', 'admin', 'hyyyy', '2026-08-01 09:50:28'),
(302, 'chat_78_admin', 'admin', 'admin', 'admin', 'jhyyy', '2026-08-01 09:50:40'),
(303, 'group_new', 'admin', 'admin', 'admin', 'hyyy', '2026-08-01 11:03:41'),
(304, 'chat_54_63', '63', 'manu', 'employee', 'hyy', '2026-08-05 10:56:52'),
(305, 'chat_54_63', '63', 'manu', 'employee', 'kyyaa kar rhe ho', '2026-08-05 10:57:03'),
(306, 'chat_54_63', '63', 'manu', 'employee', 'bolo btao', '2026-08-05 10:57:12'),
(307, 'chat_54_63', '63', 'manu', 'employee', 'hwooo', '2026-08-05 10:58:34'),
(308, 'chat_54_63', '63', 'manu', 'employee', 'kyaaa kr rhi ho', '2026-08-05 10:58:45'),
(309, 'group_as_group', 'admin', 'admin', 'admin', 'hyy', '2026-08-05 12:06:58'),
(310, 'group_as_group', 'admin', 'admin', 'admin', 'hello', '2026-08-05 12:07:04'),
(311, 'group_new', '63', 'manu', 'employee', 'hy', '2026-08-06 05:36:50'),
(312, 'group_new', '63', 'manu', 'employee', 'juu', '2026-08-06 05:36:58'),
(313, 'group_new', '63', 'manu', 'employee', 'jiii', '2026-08-06 05:37:03'),
(314, 'group_new', '63', 'manu', 'employee', 'yupppp', '2026-08-06 05:37:10'),
(315, 'group_new', '63', 'manu', 'employee', 'yess', '2026-08-06 05:37:17'),
(316, 'group_new', '63', 'manu', 'employee', 'kuch', '2026-08-06 05:37:31'),
(317, 'chat_54_admin', 'admin', 'admin', 'admin', 'hlo', '2026-08-07 05:58:13'),
(318, 'chat_[object Object]_admin', 'admin', 'admin', 'admin', 'hyy guys', '2026-08-07 05:59:07'),
(319, 'chat_82_83', '83', 'teena', 'employee', 'hii', '2026-08-10 10:12:16');

-- --------------------------------------------------------

--
-- Table structure for table `emails`
--

CREATE TABLE `emails` (
  `id` int(11) NOT NULL,
  `eventType` varchar(255) NOT NULL,
  `recipientGroup` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `message` longtext NOT NULL,
  `attachment` varchar(255) DEFAULT NULL,
  `status` enum('Draft','Scheduled','Sent','Failed') DEFAULT 'Draft',
  `created_by` int(11) DEFAULT NULL,
  `sentOn` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emails`
--

INSERT INTO `emails` (`id`, `eventType`, `recipientGroup`, `subject`, `message`, `attachment`, `status`, `created_by`, `sentOn`, `created_at`, `updated_at`) VALUES
(1, 'Task Assignment', 'Finance', 'payal', 'payal', 'payal', 'Sent', 1, '2026-07-08 04:45:57', '2026-07-08 04:45:57', '2026-07-08 04:45:57'),
(2, 'Attendance Reminder', 'Managers', 'subject ', 'subject analisis', 'pdf', 'Sent', 1, '2026-07-08 04:55:34', '2026-07-08 04:55:34', '2026-07-08 04:55:34'),
(3, 'Performance Update', 'Managers', 'LOW', 'please Grow', NULL, 'Sent', 1, '2026-07-14 08:28:22', '2026-07-14 08:28:22', '2026-07-14 08:28:22'),
(4, 'Password Reset', 'HR Team', 'hello', 'helllo', 'hello', 'Sent', 1, '2026-07-30 11:11:54', '2026-07-30 11:11:54', '2026-07-30 11:11:54'),
(5, 'Welcome', 'All Employees', 'hyy', 'hyyy helloo candidates h r u', 'based on performace ', 'Sent', 1, '2026-08-01 09:26:50', '2026-08-01 09:26:50', '2026-08-01 09:26:50'),
(6, 'Task Assignment', 'Managers', 'nnn', 'nnn', NULL, 'Sent', 1, '2026-08-06 05:51:10', '2026-08-06 05:51:10', '2026-08-06 05:51:10'),
(7, 'Welcome', 'All Employees', 'jjj', 'jj', 'jj', 'Sent', 1, '2026-08-06 05:51:25', '2026-08-06 05:51:25', '2026-08-06 05:51:25'),
(8, 'Leave Approval', 'HR Team', 'hheello', 'hello', 'h', 'Sent', 1, '2026-08-06 06:08:31', '2026-08-06 06:08:31', '2026-08-06 06:08:31'),
(9, 'Attendance Reminder', 'Managers', 'ert', 'erter', 'ert', 'Sent', 1, '2026-08-07 05:57:44', '2026-08-07 05:57:44', '2026-08-07 05:57:44');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `role_position` varchar(100) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `employee_code` varchar(50) DEFAULT NULL,
  `aadhaar_file` varchar(255) DEFAULT NULL,
  `pan_file` varchar(255) DEFAULT NULL,
  `certificate_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `role` varchar(50) DEFAULT 'user',
  `profile_pic` varchar(255) DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `leaves_left` int(11) DEFAULT 0,
  `skills` text DEFAULT NULL,
  `monthly_salary` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `email`, `phone_number`, `password`, `department`, `position`, `role_position`, `joining_date`, `employee_code`, `aadhaar_file`, `pan_file`, `certificate_file`, `created_at`, `updated_at`, `role`, `profile_pic`, `designation`, `leaves_left`, `skills`, `monthly_salary`) VALUES
(54, 'Tanishka gupta', 'tanishkagupta241@gmail.com', '+919131466621', NULL, 'tl', 'Employee', NULL, NULL, NULL, NULL, NULL, NULL, '2026-07-17 10:16:02', '2026-07-17 10:16:02', 'employee', NULL, 'rashi', 0, NULL, 20000.00),
(63, 'manu', 'guptakrishna', '91314 61', 'admin123', 'hh', NULL, 'mid', '2026-08-05', 'EMP478978', NULL, NULL, NULL, '2026-07-20 06:04:38', '2026-08-06 10:24:15', 'employee', NULL, 'rashi', 0, '[\"jjj (Intermediate)\",\"jjjj\",\"hhhhh\",\"hhh (Advanced)\",\"java (Advanced)\"]', 29998.00),
(70, 'dipika', 'dipika@gmail.com', '1234909876', 'Rashi12@', 'yes', 'Employee', 'lead', '2026-07-26', 'EMP-70', NULL, NULL, NULL, '2026-07-20 07:18:14', '2026-07-20 07:18:14', 'tl', '/uploads/profiles/1784531894086-2snap.jpeg', 'tanya', 0, NULL, 20000.00),
(73, 'yashi', 'missg3734@gmail.com', '1234567890', 'yashi12@', 'yes', 'Employee', 'lead', '2026-08-05', 'EMP-73', '/uploads/profiles/1784710466093-2snap.jpeg', '/uploads/profiles/1784710466093-2snap.jpeg', '/uploads/profiles/1784710466094-2snap.jpeg', '2026-07-22 08:54:26', '2026-07-22 08:54:26', 'manager', '/uploads/profiles/1784710466093-as_group_logo.jpeg', 'rashi', 0, NULL, 90000.00),
(75, 'rashi', 'guptarashii777@gmail.com', '+919131466621', 'Tani12@19', 'TTLL', 'Employee', 'lead', '2026-07-28', 'EMP-74', '/uploads/profiles/1784885443145-11.png', '/uploads/profiles/1784885443147-2snap.jpeg', '/uploads/profiles/1784885443147-2snap.jpeg', '2026-07-24 09:30:43', '2026-07-24 09:30:43', 'tl', '/uploads/profiles/1784885443145-WhatsApp_Image_2026-01-06_at_23.18.07.jpeg', 'rashi', 0, NULL, 50000.00),
(76, 'rashi', 'tanishkagupta2471@gmail.com', '+919131466621', 'Tani12@19', 'Sales', 'Employee', 'junior', '2026-07-28', 'EMP-76', NULL, NULL, NULL, '2026-07-24 09:48:41', '2026-07-24 09:48:41', 'employee', NULL, 'rashi', 0, NULL, 60000.00),
(77, 'veer', 'veerendrarajput08@gmail.com', '1234567890', 'veer12@34', 'tele', 'Employee', 'senior', '2026-07-28', 'EMP-77', '/uploads/profiles/1784976923697-hotel.jpeg', '/uploads/profiles/1784976923698-apiviews.jpeg', '/uploads/profiles/1784976923699-api.jpeg', '2026-07-25 10:55:23', '2026-08-01 10:12:59', 'employee', '/uploads/profiles/1784976923696-horel.jpeg', 'rashi', 0, '[\"hhh\",\"6666\"]', 70000.00),
(78, 'Muskan', 'mskntmrkr@gmail.com', '1234567890', 'Mus12@12', 'bank', 'Employee', 'lead', '2026-07-29', 'EMP-78', '/uploads/profiles/1785136123682-as_group_logo.jpeg', '/uploads/profiles/1785136123682-2snap.jpeg', '/uploads/profiles/1785136123682-2snap.jpeg', '2026-07-27 07:08:43', '2026-08-05 10:23:05', 'tl', '/uploads/profiles/1785136123681-2snap.jpeg', 'rashi', 0, '[\"dev\",\"skills (Advanced)\"]', 90000.00),
(79, 'ambika', 'ruchitiwari5757@gmail.com', '1234567801', 'ruchi12@', 'TL', 'Employee', 'lead', '2026-07-30', 'EMP-79', '/uploads/profiles/1785221517146-hotel.jpeg', '/uploads/profiles/1785221517147-11.png', '/uploads/profiles/1785221517148-as_group_logo.jpeg', '2026-07-28 06:51:57', '2026-07-28 06:52:07', 'tl', '/uploads/profiles/1785221517146-snap.jpeg', 'rashi', 0, '[\"dev\"]', 40000.00),
(80, 'payal ', 'ambikamalviya511@gmail.com', '9926482046', 'ambika@123', 'HR', 'Employee', 'senior', '2026-05-01', 'EMP-80', NULL, NULL, NULL, '2026-07-28 10:23:02', '2026-07-28 10:23:02', 'tl', '/uploads/profiles/1785234182278-2snap.jpeg', 'teena', 0, NULL, 10000.00),
(81, 'Tanishka gupta', 'ambikamalviya78@gmail.com', '+919131466621', 'Office12@', 'DA', 'Employee', 'lead', '2026-08-01', 'EMP-81', NULL, NULL, NULL, '2026-07-30 05:45:42', '2026-07-30 05:45:42', 'employee', '/uploads/profiles/1785390342030-WhatsApp_Image_2026-01-06_at_23.18.07.jpeg', 'rashi', 0, NULL, 50000.00),
(82, 'Sheetal', 'sheetudalai147@gmail.com', '1234567846', 'sheetal12@', 'CEO', 'Employee', 'lead', '2026-09-01', 'EMP-82', '/uploads/profiles/1786080951613-Screenshot_2026-03-24_161832.png', '/uploads/profiles/1786080951618-Screenshot_2026-03-24_161832.png', '/uploads/profiles/1786080951622-Screenshot_2026-03-24_161832.png', '2026-08-07 05:35:51', '2026-08-07 05:36:07', 'tl', '/uploads/profiles/1786080951586-hospital.png', 'rashi', 0, '[\"ceo\"]', 90000.00),
(83, 'teena', 'krishnamg019@gmail.com', '9131466621', 'tina12@12', 'CEO', 'Employee', 'lead', '2026-08-20', 'EMP-83', '/uploads/profiles/1786356521156-f.jpg', '/uploads/profiles/1786356521162-f.jpg', '/uploads/profiles/1786356521218-f.jpg', '2026-08-10 10:08:41', '2026-08-10 10:08:55', 'employee', '/uploads/profiles/1786356521150-Screenshot_2026-03-24_161832.png', 'software developer', 0, '[\"wer\"]', 20000.00);

-- --------------------------------------------------------

--
-- Table structure for table `hiring`
--

CREATE TABLE `hiring` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'Pending',
  `interview_date` datetime DEFAULT NULL,
  `extracted_name` varchar(255) DEFAULT NULL,
  `extracted_email` varchar(255) DEFAULT NULL,
  `extracted_phone` varchar(50) DEFAULT NULL,
  `extracted_skills` text DEFAULT NULL,
  `extracted_experience` varchar(255) DEFAULT NULL,
  `extracted_education` varchar(255) DEFAULT NULL,
  `extracted_summary` text DEFAULT NULL,
  `extracted_level` varchar(50) DEFAULT NULL,
  `extracted_experience_details` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hiring`
--

INSERT INTO `hiring` (`id`, `name`, `phone`, `email`, `position`, `message`, `resume`, `created_at`, `status`, `interview_date`, `extracted_name`, `extracted_email`, `extracted_phone`, `extracted_skills`, `extracted_experience`, `extracted_education`, `extracted_summary`, `extracted_level`, `extracted_experience_details`) VALUES
(26, 'Tanishka gupta', '+919131466621', 'tanishkagupta241@gmail.com', 'web developer', 'ssss', '1784110989196.pdf', '2026-07-15 10:23:09', 'Pending', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\"]', NULL, 'Bachelor of Science (Computer Science), 2022-2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript. Strong understanding of REST APIs, database integration, and frontend–backend connectivity.', 'Junior', NULL),
(27, 'deepak shaw', '+91123456787', 'deepak345@gmail.com', 'web developer', 'qqqqqqqqqqqqqqq', '1784111217489.pdf', '2026-07-15 10:26:57', 'Selected', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\"]', '0', 'Bachelor of Science (Computer Science), 2022 - 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', NULL),
(28, 'deepak shaw', '+91123456787', 'deepak345@gmail.com', 'web developer', 'ssssssssssss', '1784111288495.pdf', '2026-07-15 10:28:08', 'Pending', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\"]', '0', 'Bachelor of Science (Computer Science), 2022-2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications', 'Junior', NULL),
(29, 'Tanishka gupta', '+919131466621', 'tanishkagupta241@gmail.com', 'web developer', 'aaaaaaaaaaaaaaaa', '1784111494336.pdf', '2026-07-15 10:31:34', 'Pending', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 – 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', NULL),
(30, 'Tanishka gupta', '+919131466621', 'tanishkagupta241@gmail.com', 'web developer', 'eeeeeeee', '1784111803019.pdf', '2026-07-15 10:36:43', 'Interview Scheduled', '2026-07-19 21:47:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022-2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript. Strong understanding of REST APIs, database integration, and frontend–backend connectivity.', 'Junior', 'Completed hands-on training in Python Full Stack Web Development, Built full stack web applications using Python, Django, React.js, and REST APIs, Worked on backend features including authentication, CRUD operations, and database integration, Practiced frontend development with responsive UI and reusable components, Gained experience in debugging, testing, and improving application performance'),
(31, 'gupta', '+919131466621', 'tanishka241@gmail.com', 'DA', 'okk', '1784112674516.pdf', '2026-07-15 10:51:14', 'Pending', NULL, 'Alok Tripathi', 'at1706412@gmail.com', '6263940177', '[\"MS Word\",\"MS Excel\",\"MS PowerPoint\",\"Basic Computer Applications\",\"Communication Skills\",\"Teamwork\",\"Time Management\",\"Quick Learner\",\"Adaptability\",\"Quality Awareness\"]', '0', 'B.Sc. from APS University, Rewa, Madhya Pradesh and Diploma in Computer Applications (DCA) from Makhanlal Chaturvedi National University, Bhopal', 'A motivated and dedicated B.Sc. graduate with a Diploma in Computer Applications, seeking an entry-level opportunity in the food manufacturing industry', 'Junior', 'Fresher, seeking an opportunity to begin career in the food manufacturing industry'),
(32, 'rashi', '123456789', 'tanishkagupta241@gmail.com', 'DS', 'developer', '1784203918477.pdf', '2026-07-16 12:11:58', 'Interview Scheduled', '2026-07-30 09:50:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVT Architecture\",\"CRUD\"]', '0.5', 'Bachelor of Science (Computer Science), 2021-2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs', 'Junior', 'Python Full Stack Intern at AS Group, Python Developer Intern at QSkill, Full Stack Intern, and completed Python Full Stack Development Training'),
(33, 'john', '12345789', 'Rashi19@gm', 'mern dev', 'job', '1784539907021.webp', '2026-07-20 09:31:47', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(34, 'johnn', '543qw2', 'john@gmail.com', '212', 'sASas', '1784540112433.pdf', '2026-07-20 09:35:12', 'Pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(35, 'mahak', '12349098765', 'mahak12@gmail.com', 'mern dev', 'www', '1784540189833.pdf', '2026-07-20 09:36:29', 'Pending', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022-2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript', 'Junior', 'No direct work experience mentioned, but has completed hands-on training in Python Full Stack Web Development and has experience with various projects'),
(36, 'deepak shaw', '1234567890', 'deepak345@gmail.com', 'ede', 'werwe', '1784541509005.pdf', '2026-07-20 09:58:29', 'Selected', '2026-07-30 00:28:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\",\"CRUD\"]', '0.1', 'Bachelor of Science (Computer Science), 2021-2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs', 'Junior', 'Python Developer Intern at QSkill, Completed Python Full Stack Development Training'),
(37, 'Tanishka gupta', '+919131466621', 'tanishkagupta241@gmail.com', 'mern dev', 'okk', '1784541785366.pdf', '2026-07-20 10:03:05', 'Selected', '2026-07-28 10:35:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 – 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript', 'Junior', 'No direct work experience mentioned, but completed hands-on training in Python Full Stack Web Development and worked on various projects'),
(38, 'Tanishka gupta', '+919131466621', 'tanishkagupta241@gmail.com', 'mern dev', 'okkk', '1784542157549.pdf', '2026-07-20 10:09:17', 'Selected', '2026-07-28 00:27:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVT Architecture\",\"CRUD\"]', '0.5', 'Bachelor of Science (Computer Science), 2021 – 2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications', 'Junior', 'Python Developer Intern at QSkill, Python Full Stack Intern, Full Stack Development Training'),
(39, 'Tanishka gupta', '12345678098', 'tanishkagupta2411@gmail.com', 'mern dev', '', '1784542430085.pdf', '2026-07-20 10:13:50', 'Interview Scheduled', '2026-07-29 13:25:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 - 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', 'Completed hands-on training in Python Full Stack Web Development, built full stack web applications, worked on backend features including authentication, CRUD operations, and database integration, practiced frontend development with responsive UI and reusable components, gained experience in debugging, testing, and improving application performance'),
(40, 'ruchi tiwari', '7376659587', 'ruchitiwari5757@gmail.com', 'software dev.', 'job', '1784704459456.pdf', '2026-07-22 07:14:19', 'Selected', '2026-08-01 11:52:00', 'RUCHI TIWARI', 'ruchitiwari5757@gmail.com', '73766 59587', '[\"HTML5\",\"CSS\",\"JavaScript\",\"Bootstrap\",\"CSS3\",\"Ant Design\",\"ReactJs\",\"Redux\",\"Node.js\",\"React Native\",\"Express.js\",\"Typescript\",\"MongoDB\",\"Sass/Less\",\"Linux\",\"Python\",\"Materi\",\"Canva\",\"Adobe Photoshop\"]', '7.5', 'Diploma (Information technology) from BTE University Lucknow (2011 - 2014), B.tech (Information technology) from AKTU University Lucknow (2015 - 2018)', 'A dedicated and skilled Full Stack Web Application Developer with specialization in ReactJs, committed to staying current with new technologies & industry trends.', 'Senior', 'Digimatrix technologies pvt limited, Banglore: Front End React developer, Xperium, Gurugram: Senior Front End developer, Arthas Enterprises, Kanpur: Senior Software developer, NovaTech Digital Space: Software Engineer, As group. Net. In: Senior Fullstack developer'),
(42, 'shilpi tamrakar', '+919131466621', 'missg3735@gmail.com', 'DA', 'DA JOB', '1785138651119.pdf', '2026-07-27 07:50:51', 'Selected', '2026-07-30 04:55:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVT Architecture\",\"CRUD\"]', '0.5', 'Bachelor of Science (Computer Science), 2021-2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications', 'Junior', 'Python Full Stack Intern at AS Group, Narmadapuram, Python Developer Intern at QSkill, Full Stack Intern, Python Full Stack Development Training'),
(45, 'muskan', '+919131466621', 'yg8673331@gmail.com', 'DA', 'dcfd', '1785139422970.pdf', '2026-07-27 08:03:42', 'Interview Scheduled', '2026-07-30 10:33:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVT Architecture\",\"CRUD\"]', '0.1', 'Bachelor of Science (Computer Science) (2021 – 2026)', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs', 'Junior', 'Python Developer Intern at QSkill (January 2026 – February 2026), Completed industry-oriented internship, Completed structured hands-on training in Python Full Stack Web Development'),
(46, 'yashi', '+91123456787', 'guptarashii777@gmail.com', 'DA', 'aaf', '1785139639975.pdf', '2026-07-27 08:07:19', 'Interview Scheduled', '2026-07-30 13:37:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"REST API Development & Integration\"]', '0.5', 'Bachelor of Science (Computer Science), 2021 – 2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs.', 'Junior', 'Python Full Stack Intern at AS Group, Python Developer Intern at QSkill, Python Full Stack Intern, and completed Python Full Stack Development Training'),
(47, 'bhumi tamrakar', '+919131466621', 'bhumikasahu4876@gmail.com', 'DA', 'job', '1785140286126.pdf', '2026-07-27 08:18:06', 'Interview Scheduled', '2026-07-30 23:50:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\"]', '0', 'Bachelor of Science (Computer Science), 2022 – 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript', 'Junior', 'Completed hands-on training in Python Full Stack Web Development, Built full stack web applications using Python, Django, React.js, and REST APIs'),
(50, 'Tanishka gupta', '+919131466621', 'bhumika4122005@gmail.com', 'DA', 'dsfs', '1785142217091.pdf', '2026-07-27 08:50:17', 'Interview Scheduled', '2026-07-30 01:55:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 – 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', NULL),
(51, 'Tanishka gupta', '+919131466621', 'krishnamg019@gmail.com', 'sfg', 'asdad', '1785142488788.pdf', '2026-07-27 08:54:48', 'Interview Scheduled', '2026-07-30 10:25:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVC Architecture\",\"CRUD\"]', '0.1', 'Bachelor of Science (Computer Science) 2021 – 2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs.', 'Junior', 'Python Developer Intern at QSkill, Completed Python Full Stack Development Training'),
(52, 'Tanishka gupta', '+919131466621', 'missg3734@gmail.com', 'sfg', 'afa', '1785142609320.pdf', '2026-07-27 08:56:49', 'Interview Scheduled', '2026-08-26 20:57:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVC Architecture\",\"CRUD\"]', '0.1', 'Bachelor of Science (Computer Science), 2021 – 2026', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs.', 'Junior', 'Python Developer Intern at QSkill, January 2026 – February 2026. Completed Python Full Stack Development Training.'),
(54, 'sneha', '+919131466621', 'rtiwari1012@gmail.com', 'asd', 'easd', '1785222794033.pdf', '2026-07-28 07:13:14', 'Interview Scheduled', '2026-07-29 19:14:00', 'Sumit', 'Sumitrajaksumitrajak793@gmail.com', '79987789', '[\"Django\",\"Python\"]', '0', 'No education details mentioned', 'No summary available', 'Junior', 'No experience mentioned'),
(55, 'Ambika', '+919131466621', 'rg2241697@gmail.com', 'asda', 'asdasddxsa', '1785229529129.pdf', '2026-07-28 09:05:29', 'Interview Scheduled', '2026-07-30 17:08:00', 'Tanishka Bhurji', NULL, NULL, '[\"React\"]', '0.08', NULL, 'Completed 1 month training on React with A Grade from Cybrom Technology Pvt. Ltd.', 'Junior', '1 Month Training on React'),
(56, 'ambika', '9926482026', 'ambikamalviya511@gamil.com', 'hr', '', '1785235214747.pdf', '2026-07-28 10:40:14', 'Pending', NULL, 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"MySQL\",\"Git\",\"GitHub\",\"Figma\",\"Authentication\",\"Authorization\",\"MVT Architecture\",\"CRUD\"]', '0.1', 'Bachelor of Science (Computer Science) (2021-2026)', 'Python Full Stack Developer with hands-on experience in developing scalable web applications using Python, Django, React.js, and REST APIs.', 'Junior', 'Python Developer Intern at QSkill (January 2026 - February 2026), Completed structured hands-on training in Python Full Stack Web Development'),
(57, 'ambika', '9926482026', 'ambikamalviya511@gmail.com', 'hr', '', '1785235288299.pdf', '2026-07-28 10:41:28', 'Interview Scheduled', '2026-07-29 16:12:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 – 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', 'Completed hands-on training in Python Full Stack Web Development, Built full stack web applications using Python, Django, React.js, and REST APIs, Worked on backend features including authentication, CRUD operations, and database integration, Practiced frontend development with responsive UI and reusable components, Gained experience in debugging, testing, and improving application performance'),
(58, 'ambika', '9926482026', 'rg2643367@gmail.com', 'HR', 'okkkkkk', '1785388252956.pdf', '2026-07-30 05:10:52', 'Interview Scheduled', '2026-08-03 01:40:00', 'Alok Tripathi', 'at1706412@gmail.com', '6263940177', '[\"MS Word\",\"MS Excel\",\"MS PowerPoint\",\"Data Entry\",\"Computer Applications\",\"Internet & Email Handling\",\"Document Management\",\"Record Keeping\",\"Typing Skills\",\"Communication Skills\",\"Time Management\",\"Attention to Detail\",\"Basic Computer Applications\",\"Teamwork\",\"Quick Learner\",\"Adaptability\",\"Quality Awareness\"]', '0', 'B.Sc. graduate with a Diploma in Computer Applications (DCA) from Makhanlal Chaturvedi National University and APS University.', 'A motivated and detail-oriented B.Sc. graduate with a Diploma in Computer Applications (DCA), seeking an entry-level opportunity as a Data Entry Operator or in the food manufacturing industry.', 'Junior', 'Fresher, seeking an entry-level opportunity. Maintained business records, invoices, and daily transaction details with accuracy. Managed data entry, document filing, and record-keeping using MS Excel and MS Word.'),
(59, 'deepak shaw', '+91123456787', 'aaravkr415@gmail.com', 'dee', 'deeeeeeeeeeee', '1785388875661.pdf', '2026-07-30 05:21:15', 'Interview Scheduled', '2026-07-31 17:10:00', 'TANISHKA BHURJI', 'tanishkagupta241@gmail.com', '+91-9131466621', '[\"Python\",\"JavaScript\",\"Django\",\"Django REST Framework\",\"React.js\",\"HTML5\",\"CSS3\",\"Bootstrap\",\"Tailwind CSS\",\"REST API Development & Integration\",\"SQLite\",\"MySQL\",\"Git\",\"GitHub\",\"Authentication\",\"Authorization\",\"MVC Architecture\"]', '0', 'Bachelor of Science (Computer Science), 2022 - 2026', 'Python Full Stack Web Developer with hands-on training in building responsive and scalable web applications using Python, Django, React.js, and JavaScript.', 'Junior', 'Completed hands-on training in Python Full Stack Web Development, Built full stack web applications using Python, Django, React.js, and REST APIs');

-- --------------------------------------------------------

--
-- Table structure for table `kpis`
--

CREATE TABLE `kpis` (
  `id` int(11) NOT NULL,
  `employee` varchar(150) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `target` varchar(50) DEFAULT NULL,
  `achieved` varchar(50) DEFAULT NULL,
  `progress` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kpis`
--

INSERT INTO `kpis` (`id`, `employee`, `department`, `target`, `achieved`, `progress`, `status`, `created_at`) VALUES
(1, 'hrh', 'jjj', '100', '20', 4, 'process', '2026-07-01 10:29:58'),
(2, 'helooo', 'it', '100', '20', 10, 'success', '2026-07-02 04:29:13'),
(3, 'manjeet', 'hr', '100', '10%', 10, 'success', '2026-07-02 06:23:25'),
(4, 'manjeet', 'IT', 'SSE', '30', 20, 'pending', '2026-07-02 06:50:51'),
(5, 'Anurag Sharma', 'IT', '100', '20', 20, 'process', '2026-07-02 08:46:28'),
(6, 'riya', 'IT', '100', '20', 30, 'process', '2026-07-02 08:49:10'),
(7, 'niharikaa', 'IT', '100', '20', 10, 'pending', '2026-07-02 09:54:27'),
(8, 'nehaa', 'it', '100', 'haa', 30, '10', '2026-07-02 09:56:26'),
(9, 'John Doe', 'Sales', '10050', '50', 30, 'pending', '2026-07-02 09:57:24'),
(10, 'nehaa', 'Admin', '100', '70', 30, '10', '2026-07-02 10:07:47'),
(11, 'Sheetal', 'CEO', '30 days', '20%', 50, 'pending', '2026-08-07 05:49:38');

-- --------------------------------------------------------

--
-- Table structure for table `leaves`
--

CREATE TABLE `leaves` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_name` varchar(150) NOT NULL,
  `type` varchar(50) NOT NULL,
  `reason` text DEFAULT NULL,
  `date` date NOT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leaves`
--

INSERT INTO `leaves` (`id`, `employee_id`, `employee_name`, `type`, `reason`, `date`, `status`, `created_at`) VALUES
(26, 77, 'veer', 'Casual', 'hii', '2026-07-19', 'Approved', '2026-07-25 11:00:07'),
(27, 80, 'payal ', 'Casual', 'njnj', '2026-08-04', 'Approved', '2026-07-28 10:43:58'),
(28, 81, 'Tanishka gupta', 'Sick', 'h', '2026-07-30', 'Rejected', '2026-07-30 11:42:53'),
(29, 63, 'manu', 'Casual', 'hello', '2026-08-08', 'Pending', '2026-08-01 06:17:25'),
(30, 83, 'teena', 'Casual', 'f', '2026-08-27', 'Pending', '2026-08-10 10:12:26');

-- --------------------------------------------------------

--
-- Table structure for table `notices`
--

CREATE TABLE `notices` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `priority` enum('Low','Normal','Medium','High') DEFAULT 'Normal',
  `expiry` date DEFAULT NULL,
  `department` varchar(255) DEFAULT 'All',
  `attachment` varchar(255) DEFAULT NULL,
  `pinned` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notices`
--

INSERT INTO `notices` (`id`, `title`, `content`, `priority`, `expiry`, `department`, `attachment`, `pinned`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'hello users', 'hello users', 'Medium', '2026-07-08', 'Finance', 'hello users', 1, 43, '2026-07-08 11:28:56', '2026-07-28 10:34:02'),
(7, 'farewell', 'hr', 'High', '2026-08-07', 'All', 'fgf', 0, 1, '2026-08-07 05:56:42', '2026-08-07 05:56:42'),
(8, 'w4er', 'we4r', 'Medium', '2026-08-24', 'All', 'rwe', 0, 1, '2026-08-10 10:10:16', '2026-08-10 10:10:16');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` int(11) NOT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `house_rent` decimal(10,2) DEFAULT NULL,
  `medical` decimal(10,2) DEFAULT NULL,
  `travel` decimal(10,2) DEFAULT NULL,
  `overtime` decimal(10,2) DEFAULT NULL,
  `bonus` decimal(10,2) DEFAULT NULL,
  `leave_deduction` decimal(10,2) DEFAULT NULL,
  `other_deduction` decimal(10,2) DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT 'Generated',
  `month_year` varchar(20) DEFAULT 'June 2026',
  `email` varchar(100) DEFAULT NULL,
  `pf` decimal(10,2) DEFAULT 0.00,
  `esi` decimal(10,2) DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payroll`
--

INSERT INTO `payroll` (`id`, `employee_name`, `basic_salary`, `house_rent`, `medical`, `travel`, `overtime`, `bonus`, `leave_deduction`, `other_deduction`, `gross_salary`, `net_salary`, `created_at`, `status`, `month_year`, `email`, `pf`, `esi`, `tax`) VALUES
(8, 'Gupta', 10000.00, 1000.00, 2000.00, 111.00, 1000.00, 1000.00, 2000.00, 100.00, 15111.00, 11512.67, '2026-07-03 05:49:36', 'Generated', 'June 2026', NULL, 1200.00, 98.33, 200.00),
(9, 'seetal1', 30000.00, 1000.00, 8994.00, 2000.00, 2000.00, 100.00, 1999.00, 200.00, 44094.00, 37780.05, '2026-07-03 05:57:35', 'Generated', 'June 2026', NULL, 3600.00, 314.95, 200.00),
(10, 'hello', 25000.00, 500.00, 700.00, 722.00, 1000.00, 1000.00, 500.00, 400.00, 28922.00, 24620.09, '2026-07-03 06:23:45', 'Generated', 'June 2026', NULL, 3000.00, 201.91, 200.00),
(11, 'Ruchi Tiwari', 400000.00, 840.00, 849.00, 449.00, 449.00, 994.00, 949.00, 99.00, 403581.00, 351316.97, '2026-07-09 08:45:32', 'Generated', 'June 2026', NULL, 48000.00, 3016.03, 200.00),
(12, 'Ram', 79999.00, 37.00, 88.00, 78.00, 89.00, 688.00, 899.00, 700.00, 80979.00, 68978.61, '2026-07-09 09:13:49', 'Generated', 'June 2026', NULL, 9599.88, 601.51, 200.00),
(13, 'Ruchi Tiwari', 85959.00, 889.00, 88.00, 88.00, 889.00, 8.00, 9.00, 8.00, 87921.00, 76736.24, '2026-07-09 09:35:52', 'Generated', 'June 2026', NULL, 10315.08, 652.68, 200.00),
(14, 'Ruchi Tiwari', 78999.00, 78.00, 99.00, 8.00, 9.00, 89.00, 8.00, 19.00, 79282.00, 68981.24, '2026-07-09 09:43:49', 'Generated', 'June 2026', NULL, 9479.88, 593.88, 200.00),
(15, 'Ruchi Tiwari', 783893.00, 883.00, 8.00, 8.00, 8.00, 78.00, 8.00, 10.00, 784878.00, 684706.90, '2026-07-09 10:31:54', 'Generated', 'June 2026', NULL, 94067.16, 5885.94, 200.00),
(16, 'yashi', 90000.00, 1991.00, 111.00, 2121.00, 111.00, 1212.00, 1000.00, 2000.00, 95546.00, 80839.33, '2026-07-10 05:22:13', 'Generated', 'June 2026', NULL, 10800.00, 706.67, 200.00),
(17, 'sheetal', 80000.00, 1200.00, 198.00, 1000.00, 2000.00, 2000.00, 3000.00, 498.00, 86398.00, 72482.01, '2026-07-10 05:28:11', 'Generated', 'June 2026', NULL, 9600.00, 617.99, 200.00),
(18, 'tanu', 80000.00, 3000.00, 3000.00, 1000.00, 8000.00, 3000.00, 10001.00, 500.00, 98000.00, 77046.50, '2026-07-17 09:48:33', 'Generated', 'June 2026', NULL, 9600.00, 652.50, 200.00),
(19, 'rashi', 40000.00, 1000.00, 56756.00, 4545.00, 34534.00, 1111.00, 2121.00, 2212.00, 137946.00, 127845.74, '2026-07-17 11:20:12', 'Generated', 'June 2026', NULL, 4800.00, 767.26, 200.00),
(20, 'ambika', 70000.00, 8000.00, 799.00, 366.00, 535.00, 900.00, 1000.00, 2999.00, 80600.00, 67407.26, '2026-07-20 08:41:52', 'Generated', 'June 2026', NULL, 8400.00, 593.74, 200.00),
(21, 'yashi', 90000.00, 899.00, 995.00, 1000.00, 2000.00, 5000.00, 1000.00, 1995.00, 99894.00, 85202.30, '2026-07-22 08:56:16', 'Generated', 'June 2026', NULL, 10800.00, 696.70, 200.00),
(22, 'veer', 70000.00, 1000.00, 998.00, 2000.00, 4666.00, 1000.00, 0.00, 1000.00, 79664.00, 69509.01, '2026-07-25 10:56:16', 'Generated', 'June 2026', NULL, 8400.00, 554.99, 200.00),
(23, 'yashi', 90000.00, 1000.00, 1000.00, 1000.00, 1000.00, 995.00, 1000.00, 1995.00, 94995.00, 80302.50, '2026-07-27 07:10:02', 'Generated', 'June 2026', NULL, 10800.00, 697.50, 200.00),
(24, 'ambika', 40000.00, 1000.00, 111.00, 111.00, 1100.00, 111.00, 1000.00, 2999.00, 42433.00, 33124.84, '2026-07-28 06:52:47', 'Generated', 'June 2026', NULL, 4800.00, 309.16, 200.00),
(25, 'payal ', 10000.00, 8000.00, 1000.00, 4000.00, 5000.00, 1000.00, 0.00, 399.00, 29000.00, 27028.50, '2026-07-28 10:28:35', 'Generated', 'June 2026', NULL, 1200.00, 172.50, 200.00),
(26, 'Tanishka gupta', 20000.00, 10000.00, 1000.00, 1000.00, 1000.00, 1000.00, 0.00, 1999.00, 34000.00, 29161.00, '2026-07-30 05:46:32', 'Generated', 'June 2026', NULL, 2400.00, 240.00, 200.00),
(27, 'Sheetal', 90000.00, 1000.00, 1000.00, 1000.00, 1000.00, 1000.00, 0.00, 1000.00, 95000.00, 82302.50, '2026-08-07 05:37:13', 'Generated', 'June 2026', NULL, 10800.00, 697.50, 200.00),
(28, 'teena', 20000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, -4.00, 20000.00, 17254.00, '2026-08-10 10:09:14', 'Generated', 'June 2026', NULL, 2400.00, 150.00, 200.00);

-- --------------------------------------------------------

--
-- Table structure for table `payslip`
--

CREATE TABLE `payslip` (
  `id` int(11) NOT NULL,
  `employee_name` varchar(255) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `basic_salary` decimal(10,2) DEFAULT NULL,
  `house_rent` decimal(10,2) DEFAULT NULL,
  `medical` decimal(10,2) DEFAULT NULL,
  `travel` decimal(10,2) DEFAULT NULL,
  `overtime` decimal(10,2) DEFAULT NULL,
  `bonus` decimal(10,2) DEFAULT NULL,
  `leave_deduction` decimal(10,2) DEFAULT NULL,
  `other_deduction` decimal(10,2) DEFAULT NULL,
  `gross_salary` decimal(10,2) DEFAULT NULL,
  `net_salary` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Generated',
  `month_year` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `performance_reviews`
--

CREATE TABLE `performance_reviews` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reviewer_id` int(11) NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `comments` text DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `department` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `performance_reviews`
--

INSERT INTO `performance_reviews` (`id`, `employee_id`, `reviewer_id`, `rating`, `comments`, `review_date`, `department`, `created_at`) VALUES
(8, 54, 1, 9.99, 'Employee | hhh', '2026-08-06', 'tl', '2026-08-06 05:41:11'),
(9, 76, 1, 9.99, 'Employee | jjj', '2026-08-06', 'TL', '2026-08-06 05:42:01'),
(10, 73, 73, 4.00, NULL, '2026-08-06', 'yes', '2026-08-06 05:55:28'),
(11, 73, 73, 1.00, NULL, '2026-08-06', 'yes', '2026-08-06 05:56:33'),
(12, 79, 79, 5.00, NULL, '2026-08-06', 'TL', '2026-08-06 05:57:48'),
(13, 82, 79, 8.00, NULL, '2026-09-04', 'CEO', '2026-08-07 05:52:59'),
(14, 82, 1, 9.99, 'Employee | HR', '2026-08-07', 'CEO', '2026-08-07 05:55:19');

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`id`, `title`, `description`, `created_at`) VALUES
(1, 'Employee Management System', '', '2026-06-10 10:17:15'),
(2, 'jj', '', '2026-06-20 10:15:34'),
(3, 'helllo', '', '2026-06-20 10:17:01'),
(4, 'rrjrj', '', '2026-06-23 05:31:36'),
(5, 'gghh', '', '2026-06-23 05:41:12'),
(6, 'manjeet', '', '2026-06-25 07:22:19'),
(7, 'manisha', '', '2026-06-25 08:55:11'),
(8, 'hdjdjjd', '', '2026-06-25 10:45:29'),
(9, 'rashi', '', '2026-06-26 08:38:44'),
(10, 'tanu', '', '2026-06-26 10:49:05'),
(11, 'shivaa', '', '2026-07-01 10:36:53'),
(12, 'project new ', '', '2026-07-03 11:22:06'),
(13, 'rekha', '', '2026-07-06 12:24:21'),
(14, 'sneha', '', '2026-07-07 11:59:36'),
(15, '80', '', '2026-07-07 12:04:00'),
(16, 'hyy', '', '2026-07-08 07:21:42'),
(17, 'Client X', '', '2026-07-09 08:34:23'),
(18, 'tanishka', '', '2026-07-10 05:51:11'),
(19, 'okk', '', '2026-07-10 08:23:07'),
(20, 'tani', '', '2026-07-28 08:57:22'),
(21, 'ruchi', '', '2026-07-28 08:57:49'),
(22, 'ddd', '', '2026-07-30 06:19:22'),
(23, 'yyy', '', '2026-07-30 06:35:53'),
(24, 'jt', '', '2026-07-30 06:39:36'),
(25, 'novatechh', '', '2026-08-01 06:58:48'),
(26, 'client name', '', '2026-08-01 07:10:04'),
(27, 'Sumit Sahi', '', '2026-08-01 09:23:19'),
(28, 'jjjj', '', '2026-08-05 11:05:04'),
(29, 'hello', '', '2026-08-06 05:01:42'),
(30, 'clent1', '', '2026-08-06 05:34:46'),
(31, 'client', '', '2026-08-06 05:45:10'),
(32, '2q3w', '', '2026-08-10 10:10:32');

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `status` enum('Pending','In Progress','Completed') DEFAULT 'Pending',
  `task_date` date DEFAULT NULL,
  `hours` int(11) DEFAULT 0,
  `minutes` int(11) DEFAULT 0,
  `priority` enum('Low','Normal','High') DEFAULT 'Normal',
  `client_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `assign_to` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `extra_time` varchar(50) DEFAULT NULL,
  `time_tracking` varchar(50) DEFAULT NULL,
  `assignee_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `project_id`, `status`, `task_date`, `hours`, `minutes`, `priority`, `client_name`, `created_at`, `assign_to`, `remarks`, `extra_time`, `time_tracking`, `assignee_id`) VALUES
(59, 'dev', 'sdf', 9, 'Completed', '2026-07-27', 1, 1, 'Normal', 'rashi', '2026-07-28 08:55:06', NULL, NULL, NULL, NULL, 79),
(60, 'S', 'DCA', 20, 'Pending', '2026-07-28', 11, 11, 'Normal', 'tani', '2026-07-28 08:57:22', NULL, NULL, NULL, NULL, 75),
(61, 'SASA', 'zc', 21, 'Completed', '2026-07-27', 1, 1, 'Normal', 'ruchi', '2026-07-28 08:57:49', NULL, NULL, NULL, NULL, 73),
(62, 'dkdj', 'jjf', 22, 'Completed', '2026-07-29', 10, 5, 'Normal', 'ddd', '2026-07-30 06:19:22', NULL, NULL, NULL, NULL, 63),
(68, 'fjjf', 'hello users', 28, 'Pending', '2026-07-29', 2, 10, 'High', 'jjjj', '2026-08-05 11:05:04', NULL, NULL, NULL, NULL, 63),
(69, 'jjj', 'hello hello ', 2, 'Completed', '2026-08-06', 2, 10, 'High', 'jj', '2026-08-06 04:59:44', NULL, NULL, NULL, NULL, 63),
(70, 'hello', 'hello', 29, 'Completed', '2026-08-06', 3, 15, 'High', 'hello', '2026-08-06 05:01:42', NULL, NULL, NULL, NULL, 63),
(73, 'Start', 'Start', 18, 'Pending', '2026-08-07', 1, 1, 'Normal', 'Tanishka', '2026-08-07 06:00:05', NULL, NULL, NULL, NULL, 82),
(74, 'q32e', '', 32, 'Pending', '2026-08-10', 0, 0, 'Normal', '2q3w', '2026-08-10 10:10:32', NULL, NULL, NULL, NULL, 83),
(75, 'was', 'asd', 9, 'Pending', '2026-08-10', 0, 0, 'Normal', 'rashi', '2026-08-10 10:11:59', NULL, NULL, NULL, NULL, 83);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attendance_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `certificates`
--
ALTER TABLE `certificates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `certificate_type_id` (`certificate_type_id`);

--
-- Indexes for table `certificate_types`
--
ALTER TABLE `certificate_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emails`
--
ALTER TABLE `emails`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `employee_code` (`employee_code`);

--
-- Indexes for table `hiring`
--
ALTER TABLE `hiring`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kpis`
--
ALTER TABLE `kpis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leaves`
--
ALTER TABLE `leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `notices`
--
ALTER TABLE `notices`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payslip`
--
ALTER TABLE `payslip`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `certificates`
--
ALTER TABLE `certificates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `certificate_types`
--
ALTER TABLE `certificate_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chat_groups`
--
ALTER TABLE `chat_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `chat_messages`
--
ALTER TABLE `chat_messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=320;

--
-- AUTO_INCREMENT for table `emails`
--
ALTER TABLE `emails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT for table `hiring`
--
ALTER TABLE `hiring`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `kpis`
--
ALTER TABLE `kpis`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `leaves`
--
ALTER TABLE `leaves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `notices`
--
ALTER TABLE `notices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `payroll`
--
ALTER TABLE `payroll`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `payslip`
--
ALTER TABLE `payslip`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `certificates`
--
ALTER TABLE `certificates`
  ADD CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`),
  ADD CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`certificate_type_id`) REFERENCES `certificate_types` (`id`);

--
-- Constraints for table `leaves`
--
ALTER TABLE `leaves`
  ADD CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `performance_reviews`
--
ALTER TABLE `performance_reviews`
  ADD CONSTRAINT `performance_reviews_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
