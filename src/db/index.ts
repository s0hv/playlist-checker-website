import { QueryResultRow } from 'pg';
import {
  type DatabasePool,
  createPool,
  createSqlTag,
  Interceptor,
  SchemaValidationError,
} from 'slonik';
import {
  createFieldNameTransformationInterceptor,
} from 'slonik-interceptor-field-name-transformation';
import {
  createQueryLoggingInterceptor,
} from 'slonik-interceptor-query-logging';
import { z } from 'zod';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const createResultParserInterceptor = (): Interceptor => {
  return {
    name: 'result-parser',
    // Without this interceptor, the zod models are not used to validate or transform the result.
    transformRowAsync: async (executionContext, actualQuery, row) => {
      const { resultParser } = executionContext;

      if (!resultParser) {
        return row;
      }

      const validationResult = await resultParser['~standard'].validate(row);

      if (validationResult.issues) {
        throw new SchemaValidationError(
          actualQuery,
          row,
          validationResult.issues
        );
      }

      return validationResult.value as QueryResultRow;
    },
  };
};

const interceptors = [
  createQueryLoggingInterceptor(),
  createFieldNameTransformationInterceptor({
    test: () => true, // Apply to all fields
  }),
  createResultParserInterceptor(),
];

let poolPromise: Promise<DatabasePool> | undefined;

/**
 * Creates the pool on first use, so the server can start before the database is reachable.
 * A failed creation is retried by the next call.
 */
export const getPool = (): Promise<DatabasePool> => {
  poolPromise ??= createPool(process.env.DATABASE_URL!, { interceptors })
    .then(pool => {
      console.log('DATABASE CREATED');
      return pool;
    })
    .catch((error: unknown) => {
      poolPromise = undefined;
      throw error;
    });

  return poolPromise;
};

export const sql = createSqlTag({
  typeAliases: {
    void: z.strictObject({}),
    count: z.object({
      count: z.bigint().transform(Number),
    }),
  },
});
