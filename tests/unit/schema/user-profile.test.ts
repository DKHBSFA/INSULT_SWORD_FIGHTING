import { describe, it, expect } from 'vitest';
import { userProfile } from '../../../db/schema';

describe('user_profile table', () => {
	it('exists with required cols', () => {
		expect(userProfile).toBeDefined();
		expect(userProfile.userId).toBeDefined();
		expect(userProfile.language).toBeDefined();
		expect(userProfile.isNpc).toBeDefined();
	});
});
