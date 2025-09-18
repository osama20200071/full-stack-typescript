import { z } from 'zod';

// export {};

export const TaskSchema = z.object({
  id: z.coerce.number(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.coerce.boolean().default(false),
});

export const CreateTaskSchema = TaskSchema.omit({ id: true });
export const UpdateTaskSchema = TaskSchema.omit({ id: true }).partial();
export const TaskListSchema = z.array(TaskSchema);

export type Task = z.infer<typeof TaskSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
export type PartialTask = z.infer<typeof UpdateTaskSchema>;
