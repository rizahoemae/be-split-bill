CREATE TABLE if not exists `users`  (
  `user_id` integer PRIMARY KEY,
  `email` varchar(255),
  `name` varchar(255),
  `phone` varchar(255),
  `password` varchar(255),
  `created_at` timestamp
);

CREATE TABLE if not exists `items`  (
  `item_id` integer PRIMARY KEY,
  `name` varchar(255),
  `bill_id` integer,
  `created_at` timestamp
);

CREATE TABLE if not exists `bills`  (
  `bill_id` integer PRIMARY KEY,
  `name` varchar(255),
  `subtotal` float,
  `total` float,
  `tax` float,
  `service` float,
  `discount` float,
  `notes` varchar(255),
  `status` ENUM('pending', 'paid') DEFAULT 'pending',
  `created_at` timestamp
);

CREATE TABLE if not exists `bill_shares`  (
  `share_id` integer PRIMARY KEY,
  `item_id` integer,
  `user_id` integer,
  `amount` float,
  `status` ENUM('pending', 'paid') DEFAULT 'pending',
  `created_at` timestamp
);

ALTER TABLE `items` ADD FOREIGN KEY (`bill_id`) REFERENCES `bills` (`bill_id`);

ALTER TABLE `bill_shares` ADD FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`);

ALTER TABLE `bill_shares` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
