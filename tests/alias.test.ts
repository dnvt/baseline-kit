import { describe, it, expect } from 'vitest';
import * as utils from '@utils';

describe('Path alias test', () => {
  it('should import from @utils', () => {
    expect(utils).toBeDefined();
  });
});