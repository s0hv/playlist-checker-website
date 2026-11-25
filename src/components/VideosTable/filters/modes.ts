import type { Comparator } from '@/db/constants';

export type FilterMode =
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'empty'
  | 'notEmpty'
  | 'greaterThan'
  | 'greaterThanOrEqualTo'
  | 'lessThan'
  | 'lessThanOrEqualTo'
  | 'between'
  | 'betweenInclusive'
  | 'at'
  | 'before'
  | 'after'
  | 'is'
  | 'arrayContains'
  | 'arrayStartswith'
  | 'arrayEqual'
  | 'arrayAny';

export type FilterKind =
  | 'text'
  | 'id'
  | 'number'
  | 'date'
  | 'boolean'
  | 'bytes'
  | 'array'
  | 'playlist';

export type RangeValue = readonly [number, number];
export type FilterValue = string | number | boolean | Date | RangeValue | readonly number[];

export interface ColumnFilterState {
  mode: FilterMode
  value?: FilterValue
}

/**
 * The first mode of each kind is the default one.
 */
export const filterModesByKind = {
  text: ['contains', 'startsWith', 'endsWith', 'equals', 'notEquals', 'notEmpty', 'empty'],
  id: ['equals', 'notEquals'],
  number: ['equals', 'notEquals', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
  date: ['at', 'before', 'after'],
  boolean: ['is'],
  bytes: ['betweenInclusive', 'between', 'greaterThan', 'greaterThanOrEqualTo', 'lessThan', 'lessThanOrEqualTo'],
  array: ['arrayContains', 'arrayStartswith', 'arrayEqual'],
  playlist: ['arrayAny'],
} as const satisfies Record<FilterKind, readonly [FilterMode, ...FilterMode[]]>;

export const defaultFilterMode = (kind: FilterKind): FilterMode => filterModesByKind[kind][0];

export const filterModeLabels: Record<FilterMode, string> = {
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  equals: 'Equals',
  notEquals: 'Not equals',
  empty: 'Empty',
  notEmpty: 'Not empty',
  greaterThan: 'Greater than',
  greaterThanOrEqualTo: 'Greater than or equal to',
  lessThan: 'Less than',
  lessThanOrEqualTo: 'Less than or equal to',
  between: 'Between',
  betweenInclusive: 'Between inclusive',
  at: 'On date',
  before: 'Before date',
  after: 'After date',
  is: 'Is',
  arrayContains: 'Array contains',
  arrayStartswith: 'Array starts with',
  arrayEqual: 'Array equals',
  arrayAny: 'Any of',
};

/**
 * Modes that filter without a user supplied value.
 */
export const valuelessModes: ReadonlySet<FilterMode> = new Set<FilterMode>(['empty', 'notEmpty']);

export const rangeModes: ReadonlySet<FilterMode> = new Set<FilterMode>(['between', 'betweenInclusive']);

/**
 * Comparators for modes that map to exactly one API comparison.
 * Range modes and `is` are expanded separately because their comparator depends on the value.
 */
export const modeComparators = {
  contains: 'ILIKE',
  startsWith: 'ILIKE',
  endsWith: 'ILIKE',
  equals: '=',
  notEquals: '<>',
  empty: 'empty',
  notEmpty: 'notEmpty',
  greaterThan: '>',
  greaterThanOrEqualTo: '>=',
  lessThan: '<',
  lessThanOrEqualTo: '<=',
  at: 'at',
  before: 'before',
  after: 'after',
  arrayContains: 'arrayLike',
  arrayStartswith: 'arrayLike',
  arrayEqual: 'array=',
  arrayAny: 'arrayAny',
} as const satisfies Record<Exclude<FilterMode, 'between' | 'betweenInclusive' | 'is'>, Comparator>;

// Backslash is the default escape character of Postgres LIKE patterns
export const escapeLikePattern = (s: string): string => s.replace(/[\\%_]/g, '\\$&');

export const likePatterns: Partial<Record<FilterMode, (s: string) => string>> = {
  contains: s => `%${escapeLikePattern(s)}%`,
  startsWith: s => `${escapeLikePattern(s)}%`,
  endsWith: s => `%${escapeLikePattern(s)}`,
  arrayContains: s => `%${escapeLikePattern(s)}%`,
  arrayStartswith: s => `${escapeLikePattern(s)}%`,
};
