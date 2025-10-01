import { TaskClient } from '@/client.js';
import { getDatabase } from '@/database.js';
import type { inferAsyncReturnType } from '@trpc/server';

// having context so all tRPC procedures have access to the db for example.
export async function createContext() {
  // getting db instance
  const database = await getDatabase();
  const taskClient = new TaskClient(database);
  return { taskClient };
}

export type Context = inferAsyncReturnType<typeof createContext>;
