import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Calendar date without time and timezone, serialized as `YYYY-MM-DD`.
 * Employment periods are dates, not instants, so `DateTime` would be misleading.
 */
export const LocalDate = new GraphQLScalarType<Date, string>({
  name: 'LocalDate',
  description: 'Calendar date in ISO-8601 format: YYYY-MM-DD',
  serialize(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new GraphQLError('LocalDate can only serialize valid Date objects');
    }
    return value.toISOString().slice(0, 10);
  },
  parseValue(value) {
    return parseIsoDate(value);
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('LocalDate must be a string in YYYY-MM-DD format');
    }
    return parseIsoDate(ast.value);
  },
});

function parseIsoDate(value: unknown): Date {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) {
    throw new GraphQLError('LocalDate must be a string in YYYY-MM-DD format');
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new GraphQLError(`Invalid date: ${value}`);
  }
  return date;
}
