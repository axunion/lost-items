CREATE TABLE `items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`comment` text,
	`image_key` text,
	`found_at` integer,
	`location` text,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `items_list_id_idx` ON `items` (`list_id`);--> statement-breakpoint
CREATE TABLE `lists` (
	`id` text PRIMARY KEY NOT NULL,
	`public_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`name` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lists_public_id_unique` ON `lists` (`public_id`);