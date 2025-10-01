import { CreateTask, PartialTask, TaskListSchema, TaskSchema } from 'busy-bee-schema';
import { Database } from 'sqlite';

/*
  const incompleteTasks = await database.prepare('SELECT * FROM tasks whERE completed = 0');
  const completedTasks = await database.prepare('SELECT * FROM tasks WHERE completed = 1');
  const getTask = await database.prepare('SELECT * FROM tasks WHERE id = ?');
  const createTask = await database.prepare('INSERT INTO tasks (title, description) VALUES (?, ?)');
  const deleteTask = await database.prepare('DELETE FROM tasks WHERE id = ?');
  const updateTask = await database.prepare(
    `UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?`,
  );

*/

export class TaskClient {
  private database: Database;

  constructor(database: Database) {
    this.database = database;
  }

  async getTasks(completed: boolean | undefined) {
    const incompleteTasks = await this.database.prepare('SELECT * FROM tasks whERE completed = 1');
    const completedTasks = await this.database.prepare('SELECT * FROM tasks WHERE completed = 0');
    const tasks = completed ? completedTasks : incompleteTasks;
    const rawTasks = await tasks.all();
    return TaskListSchema.parse(rawTasks);
  }

  async getTask(id: number) {
    const getTaskQuery = await this.database.prepare('SELECT * FROM tasks WHERE id = ?');
    const rawTask = await getTaskQuery.get([id]);
    return TaskSchema.parse(rawTask);
  }

  async createTask(task: CreateTask) {
    const createTaskQuery = await this.database.prepare(
      'INSERT INTO tasks (title, description) VALUES (?, ?)',
    );
    const createdTask = await createTaskQuery.run([task.title, task.description]);
    return TaskSchema.parse(createdTask);
  }

  async updateTask(id: number, task: PartialTask) {
    const updateTaskQuery = await this.database.prepare(
      `UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?`,
    );

    return await updateTaskQuery.run([task.title, task.description, task.completed, id]);
  }

  async deleteTask(id: number) {
    const deleteTaskQuery = await this.database.prepare('DELETE FROM tasks WHERE id = ?');
    return await deleteTaskQuery.run([id]);
  }
}
