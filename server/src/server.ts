import cors from 'cors';
import express from 'express';
import type { Database } from 'sqlite';
import { handleError } from './handle-error.js';
import { CreateTaskSchema, TaskSchema, UpdateTaskSchema } from 'busy-bee-schema';
import { TaskClient } from './client.js';
import { ValidateSchemas } from './helper.js';

export async function createServer(database: Database) {
  const app = express();
  const client = new TaskClient(database);
  app.use(cors());
  app.use(express.json());

  const FilterSchema = TaskSchema.pick({ completed: true }).partial();
  const TaskIdSchema = TaskSchema.pick({ id: true });

  const ValidateCreateTask = ValidateSchemas({ body: CreateTaskSchema });
  const ValidateTaskParams = ValidateSchemas({ params: TaskIdSchema });
  const ValidateGetTasksQuery = ValidateSchemas({ query: FilterSchema });
  const ValidateUpdateTask = ValidateSchemas({
    params: TaskIdSchema,
    body: UpdateTaskSchema,
  });

  app.get('/tasks', ValidateGetTasksQuery, async (req, res) => {
    const { completed } = req.query;

    try {
      const tasks = client.getTasks(completed);
      return res.json(tasks);
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Get a specific task
  app.get('/tasks/:id', ValidateTaskParams, async (req, res) => {
    try {
      const { id } = req.params;
      const task = await client.getTask(id);

      if (!task) return res.status(404).json({ message: 'Task not found' });

      return res.json(task);
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  app.post('/tasks', ValidateCreateTask, async (req, res) => {
    try {
      const task = req.body;
      await client.createTask(task);
      return res.status(201).json({ message: 'Task created successfully!' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Update a task
  app.put('/tasks/:id', ValidateUpdateTask, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const previous = TaskSchema.parse(await client.getTask(+id));
      const task = { ...previous, ...updates };

      await client.updateTask(task.id, task);
      return res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  // Delete a task
  app.delete('/tasks/:id', ValidateTaskParams, async (req, res) => {
    try {
      const { id } = req.params;
      await client.deleteTask(id);
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      return handleError(req, res, error);
    }
  });

  return app;
}
