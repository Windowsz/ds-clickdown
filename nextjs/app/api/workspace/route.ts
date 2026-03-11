import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db);
}

export async function PATCH(request: Request) {
  const db = readDB();
  const body = await request.json();

  if (body.spaceId && body.action === 'toggleCollapsed') {
    db.workspace.spaces = db.workspace.spaces.map(s =>
      s.id === body.spaceId ? { ...s, collapsed: !s.collapsed } : s
    );
  }

  if (body.spaceId && body.folderId && body.action === 'toggleFolderCollapsed') {
    db.workspace.spaces = db.workspace.spaces.map(s =>
      s.id === body.spaceId
        ? { ...s, folders: s.folders.map(f => f.id === body.folderId ? { ...f, collapsed: !f.collapsed } : f) }
        : s
    );
  }

  writeDB(db);
  return NextResponse.json(db.workspace);
}
