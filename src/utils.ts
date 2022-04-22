import { format, formatDistanceToNowStrict } from 'date-fns';
import enLocale from 'date-fns/locale/en-GB';

/**
 * Returns the elements in a that are not in b
 */
export const difference = <T>(a: Set<T> | T[], b: Set<T>): T[] => {
  const diff: T[] = [];

  for (let el of a) {
    if (!b.has(el)) diff.push(el);
  }

  return diff;
};

export const none = () => null;

export const union = <T>(a: Readonly<Set<T> | T[]>, b: Readonly<Set<T> | T[]>): Set<T> => {
  const u: Set<T> = new Set<T>(b);

  for (let el of a) {
    u.add(el);
  }

  return u;
};

export const filterOperations = {
  contains: 'ILIKE',
  notContains: 'NOT ILIKE',
  startsWith: 'ILIKE',
  endsWith: 'ILIKE',
  equal: '=',
  notEqual: '<>',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  true: 'true',
  false: 'false',
  noFilter: '',
  at: 'at',
  before: 'before',
  after: 'before',
  arrayEqual: 'array=',
  arrayContains: 'arrayLike',
  arrayStartswith: 'arrayLike',
  arrayAny: 'arrayAny'
} as const;
export type FilterOperation = keyof typeof filterOperations;

export const integerFilters: FilterOperation[] = [
  'equal',
  'notEqual',
  'greaterThan',
  'greaterThanOrEqual',
  'lessThan',
  'lessThanOrEqual'
];

export const stringIdFilters: FilterOperation[] = [
  'equal',
  'notEqual'
];

export const escapePercentage = (s: string): string => s.replace(/%/g, '\%');

const noTransformation = (s: any) => s;

export const filterValueTransformations: {[key in FilterOperation]: (s: string) => string} = {
  contains: (s: string) => `%${escapePercentage(s)}%`,
  notContains: (s: string) => `%${escapePercentage(s)}%`,
  startsWith: (s: string) => `%${escapePercentage(s)}`,
  endsWith: (s: string) => `${escapePercentage(s)}%`,
  equal: noTransformation,
  notEqual: noTransformation,
  greaterThan: noTransformation,
  greaterThanOrEqual: noTransformation,
  lessThan: noTransformation,
  lessThanOrEqual: noTransformation,
  true: noTransformation,
  false: noTransformation,
  noFilter: noTransformation,
  at: noTransformation,
  before: noTransformation,
  after: noTransformation,
  arrayEqual: noTransformation,
  arrayContains: (s: string) => `%${escapePercentage(s)}%`,
  arrayStartswith: (s: string) => `${escapePercentage(s)}%`,
  arrayAny: noTransformation,
} as const;

type MaybeDate = Date | undefined | null | number;

function dateIsInvalid(date: MaybeDate): boolean {
  if (!date) return true;
  return typeof date === 'number' ?
    Number.isNaN(date) :
    Number.isNaN(date.getTime()) || date.getTime() === 0;
}

export const defaultDateFormat = (date: MaybeDate, ifUndefined='Unknown') => {
  if (dateIsInvalid(date)) return ifUndefined;

  return format(date!, 'MMM do yyyy, HH:mm', { locale: enLocale });
};

export const defaultDateDistanceToNow = (date: MaybeDate, ifUndefined='Unknown') => {
  if (dateIsInvalid(date)) return ifUndefined;

  return formatDistanceToNowStrict(date!, { addSuffix: true });
};

export const toCdnUrl = <T extends string | undefined>(filename: T): T =>
  typeof filename === 'string' ? <T>`${process.env.NEXT_PUBLIC_FILEHOST_URL}/${filename}` : <T>undefined;
