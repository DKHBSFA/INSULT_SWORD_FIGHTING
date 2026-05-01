import { describe, it, expect } from 'vitest';
import { user, account, verification } from '../../../db/schema';

describe('Better Auth tables', () => {
	it('user table has id and email', () => {
		expect(user).toBeDefined();
		expect(user.id).toBeDefined();
		expect(user.email).toBeDefined();
	});
	it('account and verification tables are exported', () => {
		expect(account).toBeDefined();
		expect(verification).toBeDefined();
	});
});
