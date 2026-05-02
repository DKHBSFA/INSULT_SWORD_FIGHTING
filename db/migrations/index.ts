import initialSql from './0000_initial.sql?raw';
import poolLanguageSql from './0001_pool_language.sql?raw';
import personaLangSql from './0002_persona_lang.sql?raw';
import difficultyAndFeedbackSql from './0003_difficulty_and_feedback.sql?raw';

export type Migration = { name: string; queries: string[] };

const splitMigration = (sql: string): string[] => {
	if (sql.includes('--> statement-breakpoint')) {
		return sql
			.split('--> statement-breakpoint')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	}
	return sql
		.split(/;\s*(?=\n|$)/)
		.map((s) => s.replace(/--.*$/gm, '').trim())
		.filter((s) => s.length > 0);
};

const migrations: Migration[] = [
	{ name: '0000_initial', queries: splitMigration(initialSql) },
	{ name: '0001_pool_language', queries: splitMigration(poolLanguageSql) },
	{ name: '0002_persona_lang', queries: splitMigration(personaLangSql) },
	{ name: '0003_difficulty_and_feedback', queries: splitMigration(difficultyAndFeedbackSql) }
];

export default migrations;
