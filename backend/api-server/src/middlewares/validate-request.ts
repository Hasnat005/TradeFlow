import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

import { AppError } from '../utils/app-error';

type ValidationSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body ?? {});
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query ?? {}) as Record<string, unknown>;
        const currentQuery = req.query as Record<string, unknown>;

        if (currentQuery && typeof currentQuery === 'object' && !Array.isArray(currentQuery)) {
          Object.keys(currentQuery).forEach((key) => {
            delete currentQuery[key];
          });

          Object.assign(currentQuery, parsedQuery);
        } else {
          Object.defineProperty(req, 'query', {
            value: parsedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        }
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params ?? {}) as Request['params'];
      }

      next();
    } catch (error) {
      const details =
        error instanceof ZodError
          ? {
              issues: error.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
              })),
            }
          : {
              name: error instanceof Error ? error.name : 'UnknownError',
              message: error instanceof Error ? error.message : String(error),
            };

      next(new AppError(400, 'Request validation failed', 'VALIDATION_ERROR', details));
    }
  };
}
