import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import type { Task } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  const updates = await request.json() as Partial<Task>;
  const now = new Date().toISOString();
  let found: Task | null = null;

  const updateInLists = (lists: typeof db.workspace.spaces[0]['lists']) =>
    lists.map(list => ({
      ...list,
      tasks: list.tasks.map(t => {
        if (t.id === params.id) {
          found = { ...t, ...updates, updatedAt: now };
          return found;
        }
        return t;
      }),
    }));

  db.workspace.spaces = db.workspace.spaces.map(space => ({
    ...space,
    lists: updateInLists(space.lists),
    folders: space.folders.map(folder => ({
      ...folder,
      lists: updateInLists(folder.lists),
    })),
  }));

  if (!found) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  writeDB(db);
  return NextResponse.json(found);
}
