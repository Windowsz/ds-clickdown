import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.notifications);
}

export async function PATCH() {
  // Mark all as read
  const db = readDB();
  db.notifications = db.notifications.map(n => ({ ...n, read: true }));
  writeDB(db);
  return NextResponse.json(db.notifications);
}
