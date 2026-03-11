import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import type { Task } from '@/lib/types';

export async function POST(request: Request) {
  const db = readDB();
  const body = await request.json() as { listId: string; task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> };
  const now = new Date().toISOString();

  const newTask: Task = {
    ...body.task,
    id: `t-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };

  const addToLists = (lists: typeof db.workspace.spaces[0]['lists']) =>
    lists.map(list =>
      list.id === body.listId ? { ...list, tasks: [...list.tasks, newTask] } : list
    );

  db.workspace.spaces = db.workspace.spaces.map(space => ({
    ...space,
    lists: addToLists(space.lists),
    folders: space.folders.map(folder => ({
      ...folder,
      lists: addToLists(folder.lists),
    })),
  }));

  writeDB(db);
  return NextResponse.json(newTask, { status: 201 });
}
