import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const db = readDB();
  db.notifications = db.notifications.map(n =>
    n.id === params.id ? { ...n, read: true } : n
  );
  writeDB(db);
  const updated = db.notifications.find(n => n.id === params.id);
  return NextResponse.json(updated ?? { error: 'Not found' });
}
