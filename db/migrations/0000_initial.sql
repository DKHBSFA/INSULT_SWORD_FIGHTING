CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`account_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `attack_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`normalized` text NOT NULL,
	`source` text NOT NULL,
	`features_json` text,
	`embedding_id` text,
	`learned_from_user_id` text,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`learned_from_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `attack_pool_by_user` ON `attack_pool` (`user_id`,`deleted_at`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `attack_pool_uniq_normalized` ON `attack_pool` (`user_id`,`normalized`) WHERE "attack_pool"."deleted_at" IS NULL;--> statement-breakpoint
CREATE TABLE `challenges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`opponent_user_id` text NOT NULL,
	`opponent_type` text DEFAULT 'ai' NOT NULL,
	`mode` text DEFAULT 'match' NOT NULL,
	`format` text NOT NULL,
	`scene_id` text NOT NULL,
	`status` text NOT NULL,
	`winner` text,
	`end_reason` text,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`opponent_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`scene_id`) REFERENCES `scenes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `challenges_by_user_status` ON `challenges` (`user_id`,`status`,`started_at`);--> statement-breakpoint
CREATE INDEX `challenges_by_status` ON `challenges` (`status`,`started_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `challenges_one_in_progress_per_user` ON `challenges` (`user_id`) WHERE "challenges"."status" = 'in_progress';--> statement-breakpoint
CREATE TABLE `defense_pool` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`text` text NOT NULL,
	`normalized` text NOT NULL,
	`source` text NOT NULL,
	`features_json` text,
	`embedding_id` text,
	`learned_from_user_id` text,
	`usage_count` integer DEFAULT 0 NOT NULL,
	`times_won` integer DEFAULT 0 NOT NULL,
	`first_won_turn_id` text,
	`created_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`learned_from_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `defense_pool_by_user` ON `defense_pool` (`user_id`,`deleted_at`,`created_at`);--> statement-breakpoint
CREATE UNIQUE INDEX `defense_pool_uniq_normalized` ON `defense_pool` (`user_id`,`normalized`) WHERE "defense_pool"."deleted_at" IS NULL;--> statement-breakpoint
CREATE TABLE `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`challenge_id` text NOT NULL,
	`match_index` integer NOT NULL,
	`first_attacker` text NOT NULL,
	`status` text NOT NULL,
	`winner` text,
	`end_reason` text,
	`score_user` integer DEFAULT 0 NOT NULL,
	`score_opponent` integer DEFAULT 0 NOT NULL,
	`score_ties` integer DEFAULT 0 NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer,
	FOREIGN KEY (`challenge_id`) REFERENCES `challenges`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `matches_challenge_index` ON `matches` (`challenge_id`,`match_index`);--> statement-breakpoint
CREATE TABLE `opponent_personas` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`sprite_set_url` text NOT NULL,
	`pool_mode` text DEFAULT 'adaptive' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `opponent_personas_user_id_unique` ON `opponent_personas` (`user_id`);--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`svg_layers_json` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `turns` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`turn_number` integer NOT NULL,
	`is_sudden_death` integer DEFAULT false NOT NULL,
	`attacker` text NOT NULL,
	`attack_text` text NOT NULL,
	`attack_source` text NOT NULL,
	`attack_personal_pool_id` text,
	`defense_text` text,
	`defense_source` text NOT NULL,
	`defense_personal_pool_id` text,
	`judgment` text NOT NULL,
	`judgment_reasoning` text,
	`judge_model` text NOT NULL,
	`opponent_model` text,
	`attack_started_at` integer NOT NULL,
	`defense_submitted_at` integer,
	`judged_at` integer NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `turns_match_turn` ON `turns` (`match_id`,`turn_number`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`name` text,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `user_profile` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text,
	`language` text DEFAULT 'en' NOT NULL,
	`is_npc` integer DEFAULT false NOT NULL,
	`settings_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
