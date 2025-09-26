import cors from 'cors';
import express, { RequestHandler } from 'express';
import type { Database } from 'sqlite';
import { handleError } from './handle-error.js';
import { CreateTaskSchema, TaskSchema, UpdateTaskSchema } from 'busy-bee-schema';
import { z, ZodSchema } from 'zod';

export async function createServer(database: Database) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const incompleteTasks = await database.prepare('SELECT * FROM tasks whERE completed = 0');
  const completedTasks = await database.prepare('SELECT * FROM tasks WHERE completed = 1');
  const getTask = await database.prepare('SELECT * FROM tasks WHERE id = ?');
  const createTask = await database.prepare('INSERT INTO tasks (title, description) VALUES (?, ?)');
  const deleteTask = await database.prepare('DELETE FROM tasks WHERE id = ?');
  const updateTask = await database.prepare(
    `UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?`,
  );

  // const ValidateCreateTask: RequestHandler<unknown, unknown, CreateTask> = (req, res, next) => {
  //   try {
  //     CreateTaskSchema.parse(req.body);
  //     next();
  //   } catch (error) {
  //     return handleError(req, res, error);
  //   }
  // };

  const ValidateBody: <T>(
    schema: ZodSchema<T>,
  ) => RequestHandler<unknown, unknown, z.infer<typeof schema>> = (schema) => (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return handleError(req, res, error);
    }
  };

  const ValidateParams: <T>(schema: ZodSchema<T>) => RequestHandler<T> =
    (schema) => (req, res, next) => {
      try {
        schema.parse(req.params);
        next();
      } catch (error) {
        return handleError(req, res, error);
      }
    };

  // we could force a specific response type also to protect us from ourselves
  const ValidateQuery: <T>(schema: ZodSchema<T>) => RequestHandler<unknown, unknown, unknown, T> =
    (schema) => (req, res, next) => {
      try {
        schema.parse(req.query);
        next();
      } catch (error) {
        return handleError(req, res, error);
      }
    };

  // ---- generic helper ----
  // type InferOrUnknown<S> = S extends ZodSchema ? z.infer<S> : unknown;

  // type SchemasOptions<
  //   B extends ZodSchema | undefined = undefined,
  //   P extends ZodSchema | undefined = undefined,
  //   Q extends ZodSchema | undefined = undefined,
  // > = {
  //   body?: B;
  //   params?: P;
  //   query?: Q;
  // };

  // // combined validator
  // function ValidateSchemas<
  //   B extends ZodSchema | undefined = undefined,
  //   P extends ZodSchema | undefined = undefined,
  //   Q extends ZodSchema | undefined = undefined,
  // >(
  //   schemas: SchemasOptions<B, P, Q>,
  // ): RequestHandler<InferOrUnknown<P>, unknown, InferOrUnknown<B>, InferOrUnknown<Q>> {
  //   return (req, res, next) => {
  //     try {
  //       if (schemas.body) schemas.body.parse(req.body);
  //       if (schemas.params) schemas.params.parse(req.params);
  //       if (schemas.query) schemas.query.parse(req.query);
  //       next();
  //     } catch (error) {
  //       return handleError(req, res, error);
  //     }
  //   };
  // }

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
  function ValidateSchemas<S extends Schemas>(
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

  const ValidateCreateTask = ValidateBody(CreateTaskSchema);
  const ValidateGetTaskParams = ValidateParams(TaskSchema.pick({ id: true }));

  const FilterSchema = TaskSchema.pick({ completed: true }).partial();
  // const ValidateGetTasksQuery = ValidateQuery(FilterSchema);

  const Validate = ValidateSchemas({
    body: CreateTaskSchema,
    params: TaskSchema.pick({ id: true }),
    query: FilterSchema,
  });

  app.get('/tasks', Validate, async (req, res) => {
    const { completed: Com } = req.query;
    const { completed, title, description } = req.body;
    const { id } = req.params;

    const query = completed ? completedTasks : incompleteTasks;

    try {
      const tasks = await query.all();
      return res.json(tasks);
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Get a specific task
  app.get('/tasks/:id', ValidateGetTaskParams, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await getTask.get([id]);

      if (!task) return res.status(404).json({ message: 'Task not found' });

      return res.json(task);
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  app.post('/tasks', ValidateCreateTask, async (req, res) => {
    try {
      // const task = CreateTaskSchema.parse(req.body);
      const task = req.body;
      // if (!task.title) return res.status(400).json({ message: 'Title is required' });

      await createTask.run([task.title, task.description]);
      return res.status(201).json({ message: 'Task created successfully!' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Update a task
  app.put('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const previous = TaskSchema.parse(await getTask.get([id]));
      const updates = UpdateTaskSchema.parse(req.body);
      const task = { ...previous, ...updates };

      await updateTask.run([task.title, task.description, task.completed, id]);
      return res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Delete a task
  app.delete('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await deleteTask.run([id]);
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  return app;
}
