import { RequestHandler } from 'express';
import { z, ZodSchema } from 'zod';
import { handleError } from './handle-error.js';

export const ValidateBody: <T>(
  schema: ZodSchema<T>,
) => RequestHandler<unknown, unknown, z.infer<typeof schema>> = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return handleError(req, res, error);
  }
};

export const ValidateParams: <T>(schema: ZodSchema<T>) => RequestHandler<T> =
  (schema) => (req, res, next) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      return handleError(req, res, error);
    }
  };

// we could force a specific response type also to protect us from ourselves
export const ValidateQuery: <T>(
  schema: ZodSchema<T>,
) => RequestHandler<unknown, unknown, unknown, T> = (schema) => (req, res, next) => {
  try {
    schema.parse(req.query);
    next();
  } catch (error) {
    return handleError(req, res, error);
  }
};

type Schemas = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

// Utility: if a schema exists, infer its type; otherwise `unknown`
type Infer<S> = S extends ZodSchema ? z.infer<S> : unknown;

/**
 * Combined validator with simpler typing.
 */
export function ValidateSchemas<S extends Schemas>(
  schemas: S,
): RequestHandler<
  Infer<S['params']>, // req.params
  unknown, // res body
  Infer<S['body']>, // req.body
  Infer<S['query']> // req.query
> {
  return (req, res, next) => {
    try {
      if (schemas.body) schemas.body.parse(req.body);
      if (schemas.params) schemas.params.parse(req.params);
      if (schemas.query) schemas.query.parse(req.query);
      next();
    } catch (error) {
      return handleError(req, res, error);
    }
  };
}
