CREATE DATABASE IF NOT EXISTS RigHub;
USE RigHub;
 
CREATE TABLE `user` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT,
  `is_banned` TINYINT(1) NOT NULL DEFAULT '0',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);
 
CREATE TABLE `component` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `category` ENUM('CPU','GPU','RAM','Storage','PSU','Case','Cooler','Motherboard') NOT NULL,
  `brand` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_by` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `user` (`id`)
);
 
CREATE TABLE `build` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `purpose` ENUM('gaming','workstation','streaming','budget','office') DEFAULT NULL,
  `cover_image_url` VARCHAR(255) DEFAULT NULL,
  `total_price` DECIMAL(10,2) DEFAULT '0.00',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);
 
CREATE TABLE `buildcomponent` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `build_id` INT NOT NULL,
  `component_id` INT NOT NULL,
  `quantity` INT NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`build_id`) REFERENCES `build` (`id`),
  FOREIGN KEY (`component_id`) REFERENCES `component` (`id`)
);
 
CREATE TABLE `review` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `build_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `rating` INT NOT NULL,
  `comment` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_review` (`build_id`,`user_id`),
  FOREIGN KEY (`build_id`) REFERENCES `build` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CHECK (`rating` >= 1 AND `rating` <= 5)
);
 
CREATE TABLE `like` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `build_id` INT NOT NULL,
  `user_id` INT NOT NULL,
  `vote_type` ENUM('up','down') NOT NULL DEFAULT 'up',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_like` (`build_id`,`user_id`),
  FOREIGN KEY (`build_id`) REFERENCES `build` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
);
