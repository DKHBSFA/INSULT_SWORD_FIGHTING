-- Add language column to attack_pool and defense_pool, default 'en' for backward compatibility.

DROP INDEX IF EXISTS attack_pool_uniq_normalized;
DROP INDEX IF EXISTS defense_pool_uniq_normalized;

ALTER TABLE attack_pool ADD COLUMN language TEXT NOT NULL DEFAULT 'en';
ALTER TABLE defense_pool ADD COLUMN language TEXT NOT NULL DEFAULT 'en';

CREATE INDEX IF NOT EXISTS attack_pool_by_user_lang ON attack_pool (user_id, language, deleted_at);
CREATE INDEX IF NOT EXISTS defense_pool_by_user_lang ON defense_pool (user_id, language, deleted_at);

CREATE UNIQUE INDEX IF NOT EXISTS attack_pool_uniq_normalized ON attack_pool (user_id, language, normalized) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS defense_pool_uniq_normalized ON defense_pool (user_id, language, normalized) WHERE deleted_at IS NULL;
