import { applyD1Migrations, env } from 'cloudflare:test';
import migrations from '../../db/migrations/index';

await applyD1Migrations(env.DB, migrations);
