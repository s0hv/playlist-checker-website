import {
  type FragmentSqlToken,
  type IdentifierSqlToken,
  type TypeNameIdentifier,
  sql,
} from 'slonik';

import type { Comparator } from '@/db/constants';

export type PreProcessor = (value: string | string[] | number | number[]) => string | number | FragmentSqlToken;
const noPreprocess: PreProcessor = value => value as string | number;
const dateValueTransform: PreProcessor = value => sql.fragment`${value}::date`;
const lowerCase: PreProcessor = value => (value as string).toLowerCase();

export type ColumnPreProcessor = (col: IdentifierSqlToken) => IdentifierSqlToken | FragmentSqlToken;
const noColumnPreProcess: ColumnPreProcessor = col => col;
const dateColumnTransform: ColumnPreProcessor = col => sql.fragment`date_trunc('day', ${col})`;

export const preProcessValue: Record<Comparator, PreProcessor> = {
  '<': noPreprocess,
  '<=': noPreprocess,
  '<>': noPreprocess,
  '>': noPreprocess,
  '>=': noPreprocess,
  'NOT ILIKE': noPreprocess,
  ILIKE: noPreprocess,
  '=': noPreprocess,
  true: _ => sql.fragment`TRUE`,
  false: _ => sql.fragment`FALSE`,
  at: dateValueTransform,
  before: dateValueTransform,
  after: dateValueTransform,
  'array=': lowerCase,
  arrayLike: noPreprocess,
  arrayAny: value => {
    const valueArray = Array.isArray(value) ? value : [value];
    const memberType: TypeNameIdentifier = typeof valueArray[0] === 'string'
      ? 'text'
      : 'int8';
    return sql.fragment`ANY(${sql.array(valueArray, memberType)})`;
  },
};

export const preProcessColumn: Record<Comparator, ColumnPreProcessor> = {
  '<': noColumnPreProcess,
  '<=': noColumnPreProcess,
  '<>': noColumnPreProcess,
  '>': noColumnPreProcess,
  '>=': noColumnPreProcess,
  'NOT ILIKE': noColumnPreProcess,
  ILIKE: noColumnPreProcess,
  '=': noColumnPreProcess,
  true: noColumnPreProcess,
  false: noColumnPreProcess,
  at: dateColumnTransform,
  before: dateColumnTransform,
  after: dateColumnTransform,
  'array=': noColumnPreProcess,
  arrayLike: noColumnPreProcess,
  arrayAny: noColumnPreProcess,
};

export const comparatorMapping: Record<Comparator, FragmentSqlToken> = {
  '<': sql.fragment`<`,
  '<=': sql.fragment`<=`,
  '<>': sql.fragment`<>`,
  '>': sql.fragment`>`,
  '>=': sql.fragment`>=`,
  'NOT ILIKE': sql.fragment`NOT ILIKE`,
  ILIKE: sql.fragment`ILIKE`,
  '=': sql.fragment`=`,
  true: sql.fragment`=`,
  false: sql.fragment`=`,
  at: sql.fragment`=`,
  before: sql.fragment`<`,
  after: sql.fragment`>`,
  'array=': sql.fragment`=`,
  arrayLike: sql.fragment`ILIKE`,
  arrayAny: sql.fragment`=`,
};
