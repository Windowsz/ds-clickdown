import { User } from './user.model';

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
  createdAt: Date;
  edited?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: User;
  uploadedAt: Date;
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: Status;
  priority: Priority;
  assignees: User[];
  dueDate?: Date;
  startDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  parentTaskId?: string;
  subtasks: Subtask[];
  tags: Tag[];
  comments: Comment[];
  attachments: Attachment[];
  timeEstimate?: number; // minutes
  timeSpent?: number; // minutes
  order: number;
  collapsed?: boolean;
  coverColor?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
  collapsed?: boolean;
}

export const DEFAULT_STATUSES: Status[] = [
  { id: 's-1', name: 'TO DO', color: '#9E9E9E', type: 'todo', order: 0 },
  { id: 's-2', name: 'IN PROGRESS', color: '#7B68EE', type: 'in-progress', order: 1 },
  { id: 's-3', name: 'IN REVIEW', color: '#FF8C00', type: 'review', order: 2 },
  { id: 's-4', name: 'DONE', color: '#00CC66', type: 'done', order: 3 },
  { id: 's-5', name: 'CLOSED', color: '#FF4444', type: 'closed', order: 4 },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string; bgColor: string }> = {
  urgent: { label: 'Urgent', color: '#FF4444', icon: 'warning', bgColor: '#FFF0F0' },
  high: { label: 'High', color: '#FF8C00', icon: 'keyboard_double_arrow_up', bgColor: '#FFF5E6' },
  normal: { label: 'Normal', color: '#0099FF', icon: 'drag_handle', bgColor: '#E6F4FF' },
  low: { label: 'Low', color: '#9E9E9E', icon: 'keyboard_double_arrow_down', bgColor: '#F5F5F5' },
};
