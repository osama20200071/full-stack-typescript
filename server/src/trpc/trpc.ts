import { initTRPC } from '@trpc/server';
import type { Context } from './trpc-context.js';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const taskRouter = router({});

// Create the app router
export const appRouter = router({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
