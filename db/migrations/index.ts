import initialSql from './0000_initial.sql?raw';

export type Migration = { name: string; queries: string[] };

const splitMigration = (sql: string): string[] =>
	sql
		.split('--> statement-breakpoint')
		.map((s) => s.trim())
		.filter((s) => s.length > 0);

const migrations: Migration[] = [{ name: '0000_initial', queries: splitMigration(initialSql) }];

export default migrations;
