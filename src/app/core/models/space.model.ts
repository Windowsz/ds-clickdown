import { Status, Task } from './task.model';
import { User } from './user.model';

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
  taskCount?: number;
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
  lists: TaskList[]; // lists directly in space (no folder)
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
