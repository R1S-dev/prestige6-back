import { ZodSchema } from 'zod';
import { RequestHandler } from 'express';

export const validate = (schema: ZodSchema): RequestHandler => (req, _res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e: any) {
    next(e);
  }
};
