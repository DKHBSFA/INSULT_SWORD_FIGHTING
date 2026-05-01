import { describe, it, expect } from 'vitest';
import { scenes } from '../../../db/schema';

describe('scenes', () => {
	it('exists', () => expect(scenes).toBeDefined());
});
