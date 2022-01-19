import {
  createPool,
} from 'slonik';
import {
  createQueryLoggingInterceptor
} from 'slonik-interceptor-query-logging';
import {
  createFieldNameTransformationInterceptor
} from 'slonik-interceptor-field-name-transformation';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const interceptors = [
  createQueryLoggingInterceptor(),
  createFieldNameTransformationInterceptor({
    format: 'CAMEL_CASE'
  }),
];

export const pool = createPool(process.env.DATABASE_URL, {
  interceptors
});
console.log('DATABASE CREATED');
