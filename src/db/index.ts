import { QueryResultRow } from 'pg';
import { createPool, Interceptor, SchemaValidationError } from 'slonik';
import { createFieldNameTransformationInterceptor } from 'slonik-interceptor-field-name-transformation';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const createResultParserInterceptor = (): Interceptor => {
  return {
    // If you are not going to transform results using Zod, then you should use `afterQueryExecution` instead.
    // Future versions of Zod will provide a more efficient parser when parsing without transformations.
    // You can even combine the two – use `afterQueryExecution` to validate results, and (conditionally)
    // transform results as needed in `transformRow`.
    transformRow: (executionContext, actualQuery, row) => {
      const {
        log,
        resultParser,
      } = executionContext;

      if (!resultParser) {
        return row;
      }

      const validationResult = resultParser.safeParse(row);

      if (!validationResult.success) {
        throw new SchemaValidationError(
          actualQuery,
          row,
          validationResult.error.issues,
        );
      }

      return validationResult.data as QueryResultRow;
    },
  };
};

const interceptors = [
  createQueryLoggingInterceptor(),
  createFieldNameTransformationInterceptor({
    format: 'CAMEL_CASE'
  }),
  createResultParserInterceptor(),
];

export const pool = await createPool(process.env.DATABASE_URL, {
  interceptors,
});
console.log('DATABASE CREATED');
