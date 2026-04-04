/**
 * Unit tests — buildClassName utility
 * Covers: maps classNames through styles, filters falsy entries, joins with space
 */

import { describe, it, expect } from 'vitest';
import { buildClassName } from './misc';

describe('buildClassName', () => {
  it('returns mapped CSS module class names joined by a space', () => {
    const styles = { foo: 'foo_abc', bar: 'bar_xyz' };
    expect(buildClassName(['foo', 'bar'], styles)).toBe('foo_abc bar_xyz');
  });

  it('filters out class names that have no mapping in styles', () => {
    const styles = { foo: 'foo_abc' };
    expect(buildClassName(['foo', 'missing'], styles)).toBe('foo_abc');
  });

  it('returns an empty string when no class names are provided', () => {
    expect(buildClassName([], { foo: 'foo_abc' })).toBe('');
  });

  it('returns an empty string when styles object is empty', () => {
    expect(buildClassName(['foo', 'bar'], {})).toBe('');
  });

  it('handles a single class name correctly', () => {
    const styles = { only: 'only_hash' };
    expect(buildClassName(['only'], styles)).toBe('only_hash');
  });

  it('filters falsy values produced by undefined style entries', () => {
    const styles = { a: 'a_hash', b: undefined as unknown as string };
    expect(buildClassName(['a', 'b'], styles)).toBe('a_hash');
  });
});
