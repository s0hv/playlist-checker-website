import { describe, expect, it } from 'vitest';

import { bytesToSliderPosition, sliderPositionToBytes } from './bytes';

describe('bytesToSliderPosition', () => {
  it('returns the slider position that produced the byte count', () => {
    for (let position = 0; position <= 100; position++) {
      expect(bytesToSliderPosition(sliderPositionToBytes(position))).toBe(position);
    }
  });

  it('clamps byte counts outside the slider range', () => {
    expect(bytesToSliderPosition(-5)).toBe(0);
    expect(bytesToSliderPosition(Number.MAX_SAFE_INTEGER)).toBe(100);
  });
});
