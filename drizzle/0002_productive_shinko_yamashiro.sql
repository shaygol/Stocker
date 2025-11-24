CREATE TABLE `list_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`listId` int,
	`name` varchar(255) NOT NULL,
	`itemCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `list_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` int NOT NULL,
	`shareToken` varchar(64) NOT NULL,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `shared_lists_id` PRIMARY KEY(`id`),
	CONSTRAINT `shared_lists_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`country` varchar(100) NOT NULL,
	`city` varchar(100),
	`latitude` int,
	`longitude` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
