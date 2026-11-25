import { describe, expect, it } from 'vitest';

import { escapeLikePattern, likePatterns } from './modes';

describe('escapeLikePattern', () => {
  it('escapes LIKE wildcards and the escape character', () => {
    expect(escapeLikePattern(String.raw`100%_a\b`)).toBe(String.raw`100\%\_a\\b`);
  });

  it('leaves plain text untouched', () => {
    expect(escapeLikePattern('plain text')).toBe('plain text');
  });
});

describe('likePatterns', () => {
  it('anchors startsWith at the beginning and endsWith at the end', () => {
    expect(likePatterns.startsWith!('abc')).toBe('abc%');
    expect(likePatterns.endsWith!('abc')).toBe('%abc');
  });

  it('escapes user input inside patterns', () => {
    expect(likePatterns.contains!('5%')).toBe(String.raw`%5\%%`);
    expect(likePatterns.arrayStartswith!('a_')).toBe(String.raw`a\_%`);
  });
});
