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
	descriptionIt: text('description_it'),
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
		language: text('language', { enum: ['en', 'it'] })
			.notNull()
			.default('en'),
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
		byUserLang: index('attack_pool_by_user_lang').on(t.userId, t.language, t.deletedAt),
		uniqNormalized: uniqueIndex('attack_pool_uniq_normalized')
			.on(t.userId, t.language, t.normalized)
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
		language: text('language', { enum: ['en', 'it'] })
			.notNull()
			.default('en'),
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
		byUserLang: index('defense_pool_by_user_lang').on(t.userId, t.language, t.deletedAt),
		uniqNormalized: uniqueIndex('defense_pool_uniq_normalized')
			.on(t.userId, t.language, t.normalized)
			.where(sql`${t.deletedAt} IS NULL`)
	})
);

export const scenes = sqliteTable('scenes', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	svgLayersJson: text('svg_layers_json').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	createdAt: integer('created_at').notNull()
});

export const challenges = sqliteTable(
	'challenges',
	{
		id: text('id').primaryKey(),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		opponentUserId: text('opponent_user_id')
			.notNull()
			.references(() => user.id),
		opponentType: text('opponent_type', { enum: ['ai', 'human'] })
			.notNull()
			.default('ai'),
		mode: text('mode', { enum: ['tutorial', 'match'] })
			.notNull()
			.default('match'),
		format: text('format', { enum: ['bo1', 'bo2'] }).notNull(),
		difficulty: text('difficulty', {
			enum: ['easy', 'medium', 'hard', 'expert', 'legendary']
		})
			.notNull()
			.default('medium'),
		modelId: text('model_id'),
		sceneId: text('scene_id')
			.notNull()
			.references(() => scenes.id),
		status: text('status', { enum: ['in_progress', 'completed', 'abandoned'] }).notNull(),
		winner: text('winner', { enum: ['user', 'opponent'] }),
		endReason: text('end_reason', {
			enum: ['matches_completed', 'abandoned', 'timeout_server']
		}),
		startedAt: integer('started_at').notNull(),
		endedAt: integer('ended_at')
	},
	(t) => ({
		byUserStatus: index('challenges_by_user_status').on(t.userId, t.status, t.startedAt),
		byStatus: index('challenges_by_status').on(t.status, t.startedAt),
		oneInProgressPerUser: uniqueIndex('challenges_one_in_progress_per_user')
			.on(t.userId)
			.where(sql`${t.status} = 'in_progress'`)
	})
);

export const matches = sqliteTable(
	'matches',
	{
		id: text('id').primaryKey(),
		challengeId: text('challenge_id')
			.notNull()
			.references(() => challenges.id, { onDelete: 'cascade' }),
		matchIndex: integer('match_index').notNull(),
		firstAttacker: text('first_attacker', { enum: ['user', 'opponent'] }).notNull(),
		status: text('status', { enum: ['in_progress', 'completed', 'abandoned'] }).notNull(),
		winner: text('winner', { enum: ['user', 'opponent'] }),
		endReason: text('end_reason', {
			enum: [
				'turns_completed',
				'sudden_death_resolved',
				'sudden_death_random_tiebreak',
				'abandoned'
			]
		}),
		scoreUser: integer('score_user').notNull().default(0),
		scoreOpponent: integer('score_opponent').notNull().default(0),
		scoreTies: integer('score_ties').notNull().default(0),
		startedAt: integer('started_at').notNull(),
		endedAt: integer('ended_at')
	},
	(t) => ({
		uniqIndex: uniqueIndex('matches_challenge_index').on(t.challengeId, t.matchIndex)
	})
);

export const judgeFeedback = sqliteTable(
	'judge_feedback',
	{
		id: text('id').primaryKey(),
		challengeId: text('challenge_id')
			.notNull()
			.references(() => challenges.id, { onDelete: 'cascade' }),
		turnId: text('turn_id').references(() => turns.id, { onDelete: 'set null' }),
		userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
		category: text('category', {
			enum: ['wrong_winner', 'wrong_reasoning', 'invented_content', 'incoherent', 'other']
		}).notNull(),
		expectedJudgment: text('expected_judgment', {
			enum: ['attacker_wins', 'defender_wins', 'tie', 'unsure']
		}),
		comment: text('comment'),
		githubIssueUrl: text('github_issue_url'),
		createdAt: integer('created_at').notNull()
	},
	(t) => ({
		byChallenge: index('judge_feedback_by_challenge').on(t.challengeId)
	})
);

export const turns = sqliteTable(
	'turns',
	{
		id: text('id').primaryKey(),
		matchId: text('match_id')
			.notNull()
			.references(() => matches.id, { onDelete: 'cascade' }),
		turnNumber: integer('turn_number').notNull(),
		isSuddenDeath: integer('is_sudden_death', { mode: 'boolean' }).notNull().default(false),
		attacker: text('attacker', { enum: ['user', 'opponent'] }).notNull(),
		attackText: text('attack_text').notNull(),
		attackSource: text('attack_source', {
			enum: ['personal_pool', 'free_text', 'opponent_npc']
		}).notNull(),
		attackPersonalPoolId: text('attack_personal_pool_id'),
		defenseText: text('defense_text'),
		defenseSource: text('defense_source', {
			enum: ['personal_pool', 'free_text', 'opponent_npc', 'timeout']
		}).notNull(),
		defensePersonalPoolId: text('defense_personal_pool_id'),
		judgment: text('judgment', {
			enum: ['attacker_wins', 'defender_wins', 'tie', 'timeout']
		}).notNull(),
		judgmentReasoning: text('judgment_reasoning'),
		judgeModel: text('judge_model').notNull(),
		opponentModel: text('opponent_model'),
		attackStartedAt: integer('attack_started_at').notNull(),
		defenseSubmittedAt: integer('defense_submitted_at'),
		judgedAt: integer('judged_at').notNull()
	},
	(t) => ({
		uniqMatchTurn: uniqueIndex('turns_match_turn').on(t.matchId, t.turnNumber)
	})
);
