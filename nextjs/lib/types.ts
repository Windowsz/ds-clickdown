// ─── Users ───────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  initials: string;
  role?: 'owner' | 'admin' | 'member';
  online?: boolean;
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export type Priority = 'urgent' | 'high' | 'normal' | 'low';
export type StatusType = 'todo' | 'in-progress' | 'review' | 'done' | 'closed';

export interface Status {
  id: string;
  name: string;
  color: string;
  type: StatusType;
  order: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
  assignee?: User;
}

export interface Comment {
  id: string;
  text: string;
  author: User;
  createdAt: string; // ISO string
  edited?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: User;
  uploadedAt: string; // ISO string
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignees: User[];
  dueDate?: string; // ISO string
  startDate?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  listId: string;
  parentTaskId?: string;
  subtasks: Subtask[];
  tags: Tag[];
  comments: Comment[];
  attachments: Attachment[];
  timeEstimate?: number;
  timeSpent?: number;
  order: number;
  collapsed?: boolean;
  coverColor?: string;
}

// ─── Workspace Structure ──────────────────────────────────────────────────────

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon?: string;
  tasks: Task[];
  statuses: Status[];
  spaceId: string;
  folderId?: string;
  order: number;
}

export interface Folder {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  lists: TaskList[];
  spaceId: string;
  order: number;
  collapsed?: boolean;
}

export interface Space {
  id: string;
  name: string;
  color: string;
  icon?: string;
  folders: Folder[];
  lists: TaskList[];
  members: User[];
  order: number;
  collapsed?: boolean;
  private?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  icon?: string;
  plan: 'free' | 'unlimited' | 'business' | 'enterprise';
  members: User[];
  spaces: Space[];
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type: 'mention' | 'assigned' | 'comment' | 'status' | 'due';
  title: string;
  message: string;
  taskId?: string;
  userId: string; // who triggered the notification
  createdAt: string; // ISO string
  read: boolean;
}

// ─── DB Shape ────────────────────────────────────────────────────────────────

export interface DB {
  workspace: Workspace;
  users: User[];
  currentUserId: string;
  notifications: Notification[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const DEFAULT_STATUSES: Status[] = [
  { id: 's-1', name: 'TO DO',       color: '#9E9E9E', type: 'todo',        order: 0 },
  { id: 's-2', name: 'IN PROGRESS', color: '#7B68EE', type: 'in-progress', order: 1 },
  { id: 's-3', name: 'IN REVIEW',   color: '#FF8C00', type: 'review',      order: 2 },
  { id: 's-4', name: 'DONE',        color: '#00CC66', type: 'done',        order: 3 },
  { id: 's-5', name: 'CLOSED',      color: '#FF4444', type: 'closed',      order: 4 },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  urgent: { label: 'Urgent', color: '#FF4444', bgColor: '#FFF0F0' },
  high:   { label: 'High',   color: '#FF8C00', bgColor: '#FFF5E6' },
  normal: { label: 'Normal', color: '#0099FF', bgColor: '#E6F4FF' },
  low:    { label: 'Low',    color: '#9E9E9E', bgColor: '#F5F5F5' },
};
