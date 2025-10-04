import {
  CreateTask,
  CreateTaskSchema,
  PartialTask,
  TaskListSchema,
  TaskSchema,
  UpdateTaskSchema,
} from '@shared/schemas';
import { API, API_URL } from './api';

export class RestApi implements API {
  constructor() {}

  async fetchTasks(showCompleted: boolean) {
    const url = new URL(`/tasks`, API_URL);

    if (showCompleted) {
      url.searchParams.set('completed', 'true');
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const tasks = TaskListSchema.parse(await response.json());
    return tasks;
  }

  async getTask(id: string) {
    const url = new URL(`/tasks/${id}`, API_URL);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch task');
    }
    const task = TaskSchema.parse(await response.json());
    return task;
  }

  async createTask(task: CreateTask) {
    const url = new URL('/tasks', API_URL);
    const parsedTask = CreateTaskSchema.parse(task);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedTask),
    });
    if (!response.ok) {
      throw new Error('Failed to create task');
    }
  }

  async updateTask(id: string, task: PartialTask) {
    console.log('Client updateTask', task);
    const url = new URL(`/tasks/${id}`, API_URL);
    const parsedTask = UpdateTaskSchema.parse(task);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedTask),
    });
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
  }

  async deleteTask(id: string) {
    const url = new URL(`/tasks/${id}`, API_URL);
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  }
}
