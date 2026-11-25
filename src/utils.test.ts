import { describe, expect, it } from 'vitest';

import { escapeLikePattern, filterOperations, filterValueTransformations } from '@/src/utils';

describe('escapeLikePattern', () => {
  it('escapes LIKE wildcards and the escape character', () => {
    expect(escapeLikePattern(String.raw`100%_a\b`)).toBe(String.raw`100\%\_a\\b`);
  });

  it('leaves plain text untouched', () => {
    expect(escapeLikePattern('plain text')).toBe('plain text');
  });
});

describe('filterValueTransformations', () => {
  it('anchors startsWith at the beginning and endsWith at the end', () => {
    expect(filterValueTransformations.startsWith('abc')).toBe('abc%');
    expect(filterValueTransformations.endsWith('abc')).toBe('%abc');
  });

  it('escapes user input inside LIKE patterns', () => {
    expect(filterValueTransformations.contains('5%')).toBe(String.raw`%5\%%`);
    expect(filterValueTransformations.arrayStartswith('a_')).toBe(String.raw`a\_%`);
  });
});

describe('filterOperations', () => {
  it('maps each date mode to its own comparator', () => {
    expect(filterOperations.at).toBe('at');
    expect(filterOperations.before).toBe('before');
    expect(filterOperations.after).toBe('after');
  });

  // The number and bytes columns offer these mode names in their filter menus
  it('defines the inclusive comparison modes offered by number columns', () => {
    expect(filterOperations.greaterThanOrEqualTo).toBe('>=');
    expect(filterOperations.lessThanOrEqualTo).toBe('<=');
  });
});
