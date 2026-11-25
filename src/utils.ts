import { format, formatDistanceToNowStrict } from 'date-fns';
import { enGB as enLocale } from 'date-fns/locale/en-GB';
import ky from 'ky';

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
