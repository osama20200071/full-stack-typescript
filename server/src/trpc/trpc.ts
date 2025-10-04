import { initTRPC } from '@trpc/server';
import type { Context } from './trpc-context.js';
import {
  CreateTaskSchema,
  TaskIdSchema,
  TaskListQuerySchema,
  UpdateTaskSchema,
} from 'busy-bee-schema';
import { z } from 'zod';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const taskRouter = router({
  getTasks: publicProcedure.input(TaskListQuerySchema).query(async ({ ctx, input }) => {
    return await ctx.taskClient.getTasks(input.completed);
  }),

  getTask: publicProcedure.input(TaskIdSchema).query(async ({ ctx, input }) => {
    return await ctx.taskClient.getTask(input.id);
  }),

  createTask: publicProcedure.input(CreateTaskSchema).mutation(async ({ ctx, input }) => {
    await ctx.taskClient.createTask(input);
    return { success: true };
  }),

  updateTask: publicProcedure
    .input(
      z.object({
        id: z.coerce.number(),
        task: UpdateTaskSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const currentTask = await ctx.taskClient.getTask(input.id);
      const task = { ...currentTask, ...input.task };
      await ctx.taskClient.updateTask(input.id, task);
      return { success: true };
    }),

  deleteTask: publicProcedure.input(TaskIdSchema).mutation(async ({ ctx, input }) => {
    await ctx.taskClient.deleteTask(input.id);
    return { success: true };
  }),
});

// Create the app router
export const appRouter = router({
  task: taskRouter,
});

// this is like the Contract
// the tRPC client depend on it for typeSafety
export type AppRouter = typeof appRouter;
