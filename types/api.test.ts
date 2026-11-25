import { describe, expect, it } from 'vitest';

import { WhereItem } from '@/types/api';

describe('WhereItem', () => {
  // Text array filters match a single element, so they send one string
  it.each(['arrayLike', 'array='])('accepts a string value for %s', comp => {
    const result = WhereItem.safeParse({ table: 'tag', col: 'tag', comp, value: '%rock%' });

    expect(result.success).toBe(true);
  });

  it('accepts an array value for arrayAny', () => {
    const result = WhereItem.safeParse({ table: 'playlist', col: 'id', comp: 'arrayAny', value: [1, 2] });

    expect(result.success).toBe(true);
  });

  it('rejects a string value for arrayAny', () => {
    const result = WhereItem.safeParse({ table: 'playlist', col: 'id', comp: 'arrayAny', value: '1' });

    expect(result.success).toBe(false);
  });
});
