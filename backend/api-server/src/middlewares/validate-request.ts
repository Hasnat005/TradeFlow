import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

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
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Request['query'];
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Request['params'];
      }

      next();
    } catch (error) {
      next(new AppError(400, 'Request validation failed', 'VALIDATION_ERROR', error));
    }
  };
}
