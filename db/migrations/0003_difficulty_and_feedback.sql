-- Add difficulty + tracked LLM model to challenges, and judge_feedback table.

ALTER TABLE challenges ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'medium';
ALTER TABLE challenges ADD COLUMN model_id TEXT;

CREATE TABLE IF NOT EXISTS judge_feedback (
    id TEXT PRIMARY KEY,
    challenge_id TEXT NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    turn_id TEXT REFERENCES turns(id) ON DELETE SET NULL,
    user_id TEXT REFERENCES user(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    expected_judgment TEXT,
    comment TEXT,
    github_issue_url TEXT,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS judge_feedback_by_challenge ON judge_feedback (challenge_id);
