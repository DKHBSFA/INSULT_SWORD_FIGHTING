import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
	name: text('name'),
	image: text('image'),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export const account = sqliteTable('account', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	providerId: text('provider_id').notNull(),
	accountId: text('account_id').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull()
});

export const verification = sqliteTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull()
});

export const userProfile = sqliteTable('user_profile', {
	userId: text('user_id')
		.primaryKey()
		.references(() => user.id, { onDelete: 'cascade' }),
	displayName: text('display_name'),
	language: text('language', { enum: ['en', 'it'] })
		.notNull()
		.default('en'),
	isNpc: integer('is_npc', { mode: 'boolean' }).notNull().default(false),
	settingsJson: text('settings_json'),
	createdAt: integer('created_at').notNull(),
	updatedAt: integer('updated_at').notNull()
});

export const opponentPersonas = sqliteTable('opponent_personas', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	description: text('description').notNull(),
	spriteSetUrl: text('sprite_set_url').notNull(),
	poolMode: text('pool_mode', { enum: ['fixed', 'adaptive'] })
		.notNull()
		.default('adaptive'),
	active: integer('active', { mode: 'boolean' }).notNull().default(true)
});

export const attackPool = sqliteTable(
	'attack_pool',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		normalized: text('normalized').notNull(),
		source: text('source', { enum: ['manual', 'seed', 'learned_from_user'] }).notNull(),
		featuresJson: text('features_json'),
		embeddingId: text('embedding_id'),
		learnedFromUserId: text('learned_from_user_id').references(() => user.id, {
			onDelete: 'set null'
		}),
		usageCount: integer('usage_count').notNull().default(0),
		createdAt: integer('created_at').notNull(),
		deletedAt: integer('deleted_at')
	},
	(t) => ({
		byUser: index('attack_pool_by_user').on(t.userId, t.deletedAt, t.createdAt),
		uniqNormalized: uniqueIndex('attack_pool_uniq_normalized')
			.on(t.userId, t.normalized)
			.where(sql`${t.deletedAt} IS NULL`)
	})
);

export const defensePool = sqliteTable(
	'defense_pool',
	{
		id: text('id').primaryKey(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		normalized: text('normalized').notNull(),
		source: text('source', {
			enum: ['manual', 'auto_won', 'seed', 'learned_from_user']
		}).notNull(),
		featuresJson: text('features_json'),
		embeddingId: text('embedding_id'),
		learnedFromUserId: text('learned_from_user_id').references(() => user.id, {
			onDelete: 'set null'
		}),
		usageCount: integer('usage_count').notNull().default(0),
		timesWon: integer('times_won').notNull().default(0),
		firstWonTurnId: text('first_won_turn_id'),
		createdAt: integer('created_at').notNull(),
		deletedAt: integer('deleted_at')
	},
	(t) => ({
		byUser: index('defense_pool_by_user').on(t.userId, t.deletedAt, t.createdAt),
		uniqNormalized: uniqueIndex('defense_pool_uniq_normalized')
			.on(t.userId, t.normalized)
			.where(sql`${t.deletedAt} IS NULL`)
	})
);
