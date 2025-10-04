import { PartialTask, CreateTask, Task } from 'busy-bee-schema';
import { tRPCApi } from './trpc-api';
// import { RestApi } from './rest-api';
export const API_URL = 'http://localhost:4001';
export type API = {
  fetchTasks: (showCompleted: boolean) => Promise<Task[]>;
  getTask: (id: string) => Promise<Task>;
  createTask: (task: CreateTask) => Promise<void>;
  updateTask: (id: string, task: PartialTask) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const api = new tRPCApi();
