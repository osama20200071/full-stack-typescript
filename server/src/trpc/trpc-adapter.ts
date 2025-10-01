import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { Router } from 'express';
import { createContext } from './trpc-context.js';
import { appRouter } from './trpc.js';

// create some middleware for express
//to integrate tRPC with Express:
/**
 * Creates an Express router with tRPC endpoints
 * @returns Express router with tRPC middleware
 */
export function createTRPCRouter() {
  const router = Router();

  router.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));
  return router;
}
