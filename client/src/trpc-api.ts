import { AppRouter } from '@server/src/trpc/trpc';
import { createTRPCProxyClient, httpBatchLink, TRPCClient } from '@trpc/client';
import { API, API_URL } from './api';
import { CreateTask, PartialTask } from '@shared/schemas';

export class tRPCApi implements API {
  client: TRPCClient<AppRouter>;
  constructor() {
    this.client = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `${API_URL}/api/trpc`,
        }),
      ],
    });
  }
  fetchTasks = async (showCompleted: boolean) => {
    return await this.client.task.getTasks.query({ completed: showCompleted });
  };

  getTask = async (id: string) => {
    return await this.client.task.getTask.query({
      id: Number(id),
    });
  };

  createTask = async (task: CreateTask): Promise<void> => {
    await this.client.task.createTask.mutate(task);
  };

  updateTask = async (id: string, task: PartialTask): Promise<void> => {
    await this.client.task.updateTask.mutate({
      id: Number(id),
      task,
    });
  };

  deleteTask = async (id: string): Promise<void> => {
    await this.client.task.deleteTask.mutate({
      id: Number(id),
    });
  };
}
