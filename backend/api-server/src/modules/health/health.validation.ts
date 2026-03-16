import { z } from 'zod';

const booleanFromQuery = z.preprocess((value) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false || value === undefined) {
    return false;
  }

  return value;
}, z.boolean());

export const readinessQuerySchema = z.object({
  verbose: booleanFromQuery.optional().default(false),
});
