import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  description: z.string().nullable(),
  completed: z.coerce.boolean().default(false),
});

export const CreateTaskSchema = TaskSchema.omit({ id: true });
export const UpdateTaskSchema = TaskSchema.omit({ id: true }).partial();
export const TaskListSchema = z.array(TaskSchema);
export const TaskListQuerySchema = TaskSchema.pick({ completed: true }).partial();
export const FilterSchema = TaskSchema.pick({ completed: true }).partial();
export const TaskIdSchema = TaskSchema.pick({ id: true });

export type Task = z.infer<typeof TaskSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
export type PartialTask = z.infer<typeof UpdateTaskSchema>;
export type CreateTask = z.infer<typeof CreateTaskSchema>;
