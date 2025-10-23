import { format, formatDistanceToNowStrict } from 'date-fns';
import { enGB as enLocale } from 'date-fns/locale/en-GB';
import ky from 'ky';

import { FilterType } from '@/components/VideosTable/types';

/**
 * Returns the elements in a that are not in b
 */
export const difference = <T>(a: Set<T> | T[], b: Set<T>): T[] => {
  const diff: T[] = [];

  for (const el of a) {
    if (!b.has(el)) diff.push(el);
  }

  return diff;
};

export const none = () => null;

export const union = <T>(a: Readonly<Set<T> | T[]>, b: Readonly<Set<T> | T[]>): Set<T> => {
  const u: Set<T> = new Set<T>(b);

  for (const el of a) {
    u.add(el);
  }

  return u;
};

export const filterOperations = {
  contains: 'ILIKE',
  notContains: 'NOT ILIKE',
  startsWith: 'ILIKE',
  endsWith: 'ILIKE',
  equals: '=',
  notEquals: '<>',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  true: 'true',
  false: 'false',
  noFilter: null,
  at: 'at',
  before: 'before',
  after: 'before',
  arrayEqual: 'array=',
  arrayContains: 'arrayLike',
  arrayStartswith: 'arrayLike',
  arrayAny: 'arrayAny',
  between: 'between',
  betweenInclusive: 'betweenInclusive',
} as const satisfies Partial<Record<FilterType, string | null>>;
export type FilterOperation = keyof typeof filterOperations;

export const escapePercentage = (s: string): string => s.replace(/%/g, '%');

const noTransformation = <T>(s: T) => s;
const noValueTransform = (_: unknown) => '';

export const filterValueTransformations: Record<FilterOperation, (s: string) => string> = {
  contains: (s: string) => `%${escapePercentage(s)}%`,
  notContains: (s: string) => `%${escapePercentage(s)}%`,
  startsWith: (s: string) => `%${escapePercentage(s)}`,
  endsWith: (s: string) => `${escapePercentage(s)}%`,
  equals: noTransformation,
  notEquals: noTransformation,
  greaterThan: noTransformation,
  greaterThanOrEqual: noTransformation,
  lessThan: noTransformation,
  lessThanOrEqual: noTransformation,
  true: noValueTransform,
  false: noValueTransform,
  noFilter: noValueTransform,
  at: noTransformation,
  before: noTransformation,
  after: noTransformation,
  arrayEqual: noTransformation,
  arrayContains: (s: string) => `%${escapePercentage(s)}%`,
  arrayStartswith: (s: string) => `${escapePercentage(s)}%`,
  arrayAny: noTransformation,
  between: noTransformation,
  betweenInclusive: noTransformation,
} as const;

type MaybeDate = Date | undefined | null | number;

function dateIsInvalid(date: MaybeDate): boolean {
  if (!date) return true;
  return typeof date === 'number'
    ? Number.isNaN(date)
    : Number.isNaN(date.getTime()) || date.getTime() === 0;
}

export const defaultDateFormat = (date: MaybeDate, ifUndefined = 'Unknown') => {
  if (dateIsInvalid(date)) return ifUndefined;

  return format(date!, 'MMM do yyyy, HH:mm', { locale: enLocale });
};

export const defaultDateDistanceToNow = (date: MaybeDate, ifUndefined = 'Unknown') => {
  if (dateIsInvalid(date)) return ifUndefined;

  return formatDistanceToNowStrict(date!, { addSuffix: true });
};

export const toCdnUrl = <T extends string | undefined>(filename: T | null): T =>
  typeof filename === 'string' ? <T>`${import.meta.env.VITE_PUBLIC_FILEHOST_URL}/${filename}` : <T>undefined;

export const baseKy = ky.create({ timeout: 20_000 });
