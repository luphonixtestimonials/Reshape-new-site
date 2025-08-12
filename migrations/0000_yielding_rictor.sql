CREATE TABLE `member_profiles` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`membership_tier_id` text,
	`assigned_trainer_id` text,
	`join_date` integer DEFAULT (unixepoch()),
	`fitness_goals` text,
	`medical_conditions` text,
	`emergency_contact` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tiers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_trainer_id`) REFERENCES `trainer_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `membership_tiers` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`name` text NOT NULL,
	`monthly_price` real NOT NULL,
	`annual_price` real NOT NULL,
	`benefits` text NOT NULL,
	`max_guests` integer DEFAULT 0,
	`personal_training_included` integer DEFAULT 0,
	`created_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `nutrition_plans` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`trainer_id` text NOT NULL,
	`member_id` text NOT NULL,
	`title` text NOT NULL,
	`daily_calories` integer,
	`meals` text NOT NULL,
	`dietary_restrictions` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainer_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `member_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sid` text PRIMARY KEY NOT NULL,
	`sess` text NOT NULL,
	`expire` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `IDX_session_expire` ON `sessions` (`expire`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`member_id` text NOT NULL,
	`membership_tier_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`is_active` integer DEFAULT true,
	`auto_renew` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`member_id`) REFERENCES `member_profiles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`membership_tier_id`) REFERENCES `membership_tiers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trainer_profiles` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`user_id` text NOT NULL,
	`specializations` text,
	`certifications` text,
	`experience_years` integer,
	`hourly_rate` real,
	`bio` text,
	`is_available` integer DEFAULT true,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `training_sessions` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`trainer_id` text NOT NULL,
	`member_id` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`session_type` text,
	`status` text DEFAULT 'scheduled',
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainer_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `member_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`email` text,
	`first_name` text,
	`last_name` text,
	`profile_image_url` text,
	`user_type` text DEFAULT 'member' NOT NULL,
	`phone` text,
	`date_of_birth` text,
	`stripe_customer_id` text,
	`stripe_subscription_id` text,
	`created_at` integer DEFAULT (unixepoch()),
	`updated_at` integer DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `workout_plans` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`trainer_id` text NOT NULL,
	`member_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`exercises` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()),
	FOREIGN KEY (`trainer_id`) REFERENCES `trainer_profiles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `member_profiles`(`id`) ON UPDATE no action ON DELETE no action
);
