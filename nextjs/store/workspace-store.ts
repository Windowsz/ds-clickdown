'use client';

import { create } from 'zustand';
import type {
  Workspace, Space, TaskList, Task, User, Notification, Status,
  Priority, DB,
} from '@/lib/types';
import { DEFAULT_STATUSES } from '@/lib/types';

// ─── Helper – resolve user IDs stored in db.json ──────────────────────────────

function resolveUsers(ids: (string | User)[], allUsers: User[]): User[] {
  return (ids ?? []).map(u =>
    typeof u === 'string' ? allUsers.find(x => x.id === u) ?? ({ id: u } as User) : u
  );
}

function hydrateWorkspace(workspace: Workspace, users: User[]): Workspace {
  return {
    ...workspace,
    spaces: workspace.spaces.map(space => ({
      ...space,
      members: resolveUsers(space.members as unknown as string[], users),
      lists: space.lists.map(list => hydrateList(list, users)),
      folders: space.folders.map(folder => ({
        ...folder,
        lists: folder.lists.map(list => hydrateList(list, users)),
      })),
    })),
  };
}

function hydrateList(list: TaskList, users: User[]): TaskList {
  return {
    ...list,
    tasks: list.tasks.map(task => ({
      ...task,
      assignees: resolveUsers(task.assignees as unknown as string[], users),
      comments: task.comments.map(c => ({
        ...c,
        author: typeof c.author === 'string'
          ? users.find(u => u.id === c.author) ?? ({ id: c.author } as User)
          : c.author,
      })),
    })),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export type ActiveView = 'list' | 'board' | 'calendar' | 'gantt' | 'table';

interface WorkspaceState {
  // Data
  workspace: Workspace | null;
  allUsers: User[];
  currentUser: User | null;
  notifications: Notification[];

  // UI State
  activeListId: string | null;
  activeSpaceId: string | null;
  activeView: ActiveView;
  selectedTaskId: string | null;
  sidebarCollapsed: boolean;
  taskDetailOpen: boolean;
  initialized: boolean;

  // Actions – init
  initFromDB: (db: DB) => void;

  // Actions – navigation
  setActiveList: (id: string) => void;
  setActiveSpace: (id: string) => void;
  setActiveView: (view: ActiveView) => void;
  selectTask: (id: string | null) => void;
  toggleSidebar: () => void;

  // Actions – workspace mutations
  toggleSpaceCollapsed: (spaceId: string) => void;
  toggleFolderCollapsed: (spaceId: string, folderId: string) => void;

  // Actions – tasks
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (listId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;

  // Actions – notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Derived helpers
  getAllLists: () => TaskList[];
  getListById: (id: string) => TaskList | undefined;
  getSpaceById: (id: string) => Space | undefined;
  getAllTasks: () => Task[];
  getMyTasks: () => Task[];
  getOverdueTasks: () => Task[];
  getDueTodayTasks: () => Task[];
  getTaskById: (id: string) => Task | undefined;
  getUnreadCount: () => number;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspace: null,
  allUsers: [],
  currentUser: null,
  notifications: [],
  activeListId: null,
  activeSpaceId: 'sp-1',
  activeView: 'list',
  selectedTaskId: null,
  sidebarCollapsed: false,
  taskDetailOpen: false,
  initialized: false,

  // ── Init ──────────────────────────────────────────────────────────────────

  initFromDB: (db: DB) => {
    const workspace = hydrateWorkspace(db.workspace, db.users);
    const currentUser = db.users.find(u => u.id === db.currentUserId) ?? db.users[0];
    set({
      workspace,
      allUsers: db.users,
      currentUser,
      notifications: db.notifications,
      initialized: true,
    });
  },

  // ── Navigation ────────────────────────────────────────────────────────────

  setActiveList: (id) => set({ activeListId: id }),
  setActiveSpace: (id) => set({ activeSpaceId: id }),
  setActiveView: (view) => set({ activeView: view }),
  selectTask: (id) => set({ selectedTaskId: id, taskDetailOpen: id !== null }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  // ── Workspace mutations ────────────────────────────────────────────────────

  toggleSpaceCollapsed: (spaceId) => {
    set(s => {
      if (!s.workspace) return {};
      const workspace = {
        ...s.workspace,
        spaces: s.workspace.spaces.map(sp =>
          sp.id === spaceId ? { ...sp, collapsed: !sp.collapsed } : sp
        ),
      };
      // Persist
      fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, action: 'toggleCollapsed' }),
      });
      return { workspace };
    });
  },

  toggleFolderCollapsed: (spaceId, folderId) => {
    set(s => {
      if (!s.workspace) return {};
      const workspace = {
        ...s.workspace,
        spaces: s.workspace.spaces.map(sp =>
          sp.id === spaceId
            ? { ...sp, folders: sp.folders.map(f => f.id === folderId ? { ...f, collapsed: !f.collapsed } : f) }
            : sp
        ),
      };
      fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, folderId, action: 'toggleFolderCollapsed' }),
      });
      return { workspace };
    });
  },

  // ── Tasks ─────────────────────────────────────────────────────────────────

  updateTask: (taskId, updates) => {
    const now = new Date().toISOString();
    set(s => {
      if (!s.workspace) return {};

      const updateInLists = (lists: TaskList[]) =>
        lists.map(list => ({
          ...list,
          tasks: list.tasks.map(t =>
            t.id === taskId ? { ...t, ...updates, updatedAt: now } : t
          ),
        }));

      const workspace = {
        ...s.workspace,
        spaces: s.workspace.spaces.map(sp => ({
          ...sp,
          lists: updateInLists(sp.lists),
          folders: sp.folders.map(f => ({ ...f, lists: updateInLists(f.lists) })),
        })),
      };

      // Persist
      fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, updatedAt: now }),
      });

      return { workspace };
    });
  },

  addTask: (listId, task) => {
    const now = new Date().toISOString();
    const newTask: Task = { ...task, id: `t-${Date.now()}`, createdAt: now, updatedAt: now };

    set(s => {
      if (!s.workspace) return {};

      const addToLists = (lists: TaskList[]) =>
        lists.map(list =>
          list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        );

      const workspace = {
        ...s.workspace,
        spaces: s.workspace.spaces.map(sp => ({
          ...sp,
          lists: addToLists(sp.lists),
          folders: sp.folders.map(f => ({ ...f, lists: addToLists(f.lists) })),
        })),
      };

      // Persist
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listId, task }),
      });

      return { workspace };
    });
  },

  // ── Notifications ─────────────────────────────────────────────────────────

  markNotificationRead: (id) => {
    set(s => ({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
    }));
    fetch(`/api/notifications/${id}`, { method: 'PATCH' });
  },

  markAllNotificationsRead: () => {
    set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) }));
    fetch('/api/notifications', { method: 'PATCH' });
  },

  // ── Derived helpers ───────────────────────────────────────────────────────

  getAllLists: () => {
    const ws = get().workspace;
    if (!ws) return [];
    const lists: TaskList[] = [];
    for (const space of ws.spaces) {
      lists.push(...space.lists);
      for (const folder of space.folders) lists.push(...folder.lists);
    }
    return lists;
  },

  getListById: (id) => get().getAllLists().find(l => l.id === id),
  getSpaceById: (id) => get().workspace?.spaces.find(s => s.id === id),
  getAllTasks: () => get().getAllLists().flatMap(l => l.tasks),

  getMyTasks: () => {
    const uid = get().currentUser?.id;
    return get().getAllTasks().filter(t => t.assignees.some(a => a.id === uid));
  },

  getOverdueTasks: () => {
    const now = new Date().toISOString();
    return get().getAllTasks().filter(t =>
      t.dueDate && t.dueDate < now && t.status.type !== 'done' && t.status.type !== 'closed'
    );
  },

  getDueTodayTasks: () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return get().getAllTasks().filter(t =>
      t.dueDate && t.dueDate >= today.toISOString() && t.dueDate < tomorrow.toISOString()
    );
  },

  getTaskById: (id) => get().getAllTasks().find(t => t.id === id),
  getUnreadCount: () => get().notifications.filter(n => !n.read).length,
}));

// ── Bootstrap helper (call once at app level) ─────────────────────────────────

let booted = false;
export async function bootStore() {
  if (booted) return;
  booted = true;
  try {
    const res = await fetch('/api/workspace');
    const db: DB = await res.json();
    useWorkspaceStore.getState().initFromDB(db);
  } catch (e) {
    console.error('Failed to load workspace', e);
  }
}
