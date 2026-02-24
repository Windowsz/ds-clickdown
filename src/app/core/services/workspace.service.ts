import { Injectable, signal, computed } from '@angular/core';
import { Workspace, Space, Folder, TaskList } from '../models/space.model';
import { Task, Status, DEFAULT_STATUSES, Priority } from '../models/task.model';
import { User, CURRENT_USER } from '../models/user.model';

const USERS: User[] = [
  CURRENT_USER,
  { id: 'user-2', name: 'Sarah Chen', email: 'sarah@company.com', color: '#FF69B4', initials: 'SC', role: 'admin', online: true },
  { id: 'user-3', name: 'Marcus Williams', email: 'marcus@company.com', color: '#00CC66', initials: 'MW', role: 'member', online: false },
  { id: 'user-4', name: 'Priya Patel', email: 'priya@company.com', color: '#FF8C00', initials: 'PP', role: 'member', online: true },
  { id: 'user-5', name: 'Tom Russo', email: 'tom@company.com', color: '#0099FF', initials: 'TR', role: 'member', online: false },
];

function makeTask(overrides: Partial<Task> & { id: string; name: string; listId: string }): Task {
  const now = new Date();
  return {
    description: '',
    status: DEFAULT_STATUSES[0],
    priority: 'normal',
    assignees: [],
    createdAt: now,
    updatedAt: now,
    subtasks: [],
    tags: [],
    comments: [],
    attachments: [],
    order: 0,
    ...overrides,
  };
}

const DESIGN_TASKS: Task[] = [
  makeTask({
    id: 't-1', name: 'Design new landing page hero section', listId: 'list-1',
    status: DEFAULT_STATUSES[1], priority: 'high',
    assignees: [USERS[1]], dueDate: new Date(Date.now() + 2 * 86400000),
    tags: [{ id: 'tag-1', name: 'Design', color: '#FF69B4' }],
    description: 'Redesign the hero section with new brand guidelines. Include CTA buttons and gradient background.',
    subtasks: [
      { id: 'st-1', name: 'Create wireframes', completed: true },
      { id: 'st-2', name: 'Get design approval', completed: false },
      { id: 'st-3', name: 'Implement in Figma', completed: false },
    ],
    comments: [
      { id: 'c-1', text: 'Looking great so far! Can we try a darker gradient?', author: USERS[0], createdAt: new Date(Date.now() - 3600000) },
    ],
    order: 0,
  }),
  makeTask({
    id: 't-2', name: 'Update component library tokens', listId: 'list-1',
    status: DEFAULT_STATUSES[0], priority: 'normal',
    assignees: [USERS[1], USERS[3]],
    tags: [{ id: 'tag-1', name: 'Design', color: '#FF69B4' }, { id: 'tag-2', name: 'System', color: '#7B68EE' }],
    order: 1,
  }),
  makeTask({
    id: 't-3', name: 'Mobile app icon variants', listId: 'list-1',
    status: DEFAULT_STATUSES[3], priority: 'low',
    assignees: [USERS[1]], dueDate: new Date(Date.now() - 86400000),
    order: 2,
  }),
  makeTask({
    id: 't-4', name: 'Dark mode design system', listId: 'list-1',
    status: DEFAULT_STATUSES[2], priority: 'high',
    assignees: [USERS[0], USERS[1]],
    tags: [{ id: 'tag-1', name: 'Design', color: '#FF69B4' }],
    order: 3,
  }),
];

const FRONTEND_TASKS: Task[] = [
  makeTask({
    id: 't-10', name: 'Implement authentication flow', listId: 'list-2',
    status: DEFAULT_STATUSES[1], priority: 'urgent',
    assignees: [USERS[0]], dueDate: new Date(Date.now() + 86400000),
    tags: [{ id: 'tag-3', name: 'Frontend', color: '#0099FF' }, { id: 'tag-4', name: 'Auth', color: '#FF4444' }],
    description: 'Implement OAuth2 login with Google and GitHub. Handle token refresh and session management.',
    subtasks: [
      { id: 'st-10', name: 'Setup OAuth providers', completed: true },
      { id: 'st-11', name: 'Handle token refresh', completed: true },
      { id: 'st-12', name: 'Session persistence', completed: false },
      { id: 'st-13', name: 'E2E tests', completed: false },
    ],
    order: 0,
  }),
  makeTask({
    id: 't-11', name: 'Dashboard analytics charts', listId: 'list-2',
    status: DEFAULT_STATUSES[0], priority: 'normal',
    assignees: [USERS[2]], dueDate: new Date(Date.now() + 5 * 86400000),
    tags: [{ id: 'tag-3', name: 'Frontend', color: '#0099FF' }],
    order: 1,
  }),
  makeTask({
    id: 't-12', name: 'Real-time notifications system', listId: 'list-2',
    status: DEFAULT_STATUSES[0], priority: 'high',
    assignees: [USERS[0], USERS[2]],
    order: 2,
  }),
  makeTask({
    id: 't-13', name: 'Performance optimization - lazy loading', listId: 'list-2',
    status: DEFAULT_STATUSES[2], priority: 'normal',
    assignees: [USERS[4]],
    tags: [{ id: 'tag-5', name: 'Performance', color: '#00CC66' }],
    order: 3,
  }),
  makeTask({
    id: 't-14', name: 'Accessibility audit and fixes', listId: 'list-2',
    status: DEFAULT_STATUSES[0], priority: 'high',
    assignees: [USERS[0]],
    tags: [{ id: 'tag-6', name: 'a11y', color: '#7B68EE' }],
    order: 4,
  }),
];

const BACKEND_TASKS: Task[] = [
  makeTask({
    id: 't-20', name: 'API rate limiting implementation', listId: 'list-3',
    status: DEFAULT_STATUSES[1], priority: 'high',
    assignees: [USERS[2]], dueDate: new Date(Date.now() + 3 * 86400000),
    tags: [{ id: 'tag-7', name: 'Backend', color: '#FF8C00' }, { id: 'tag-8', name: 'Security', color: '#FF4444' }],
    order: 0,
  }),
  makeTask({
    id: 't-21', name: 'Database query optimization', listId: 'list-3',
    status: DEFAULT_STATUSES[3], priority: 'urgent',
    assignees: [USERS[2], USERS[4]],
    order: 1,
  }),
  makeTask({
    id: 't-22', name: 'Implement webhook system', listId: 'list-3',
    status: DEFAULT_STATUSES[0], priority: 'normal',
    assignees: [USERS[4]],
    order: 2,
  }),
];

const MARKETING_TASKS: Task[] = [
  makeTask({
    id: 't-30', name: 'Q1 email campaign setup', listId: 'list-4',
    status: DEFAULT_STATUSES[0], priority: 'high',
    assignees: [USERS[3]], dueDate: new Date(Date.now() + 7 * 86400000),
    tags: [{ id: 'tag-9', name: 'Marketing', color: '#FF69B4' }],
    order: 0,
  }),
  makeTask({
    id: 't-31', name: 'Blog post: Product roadmap 2026', listId: 'list-4',
    status: DEFAULT_STATUSES[1], priority: 'normal',
    assignees: [USERS[3]],
    order: 1,
  }),
  makeTask({
    id: 't-32', name: 'Social media content calendar', listId: 'list-4',
    status: DEFAULT_STATUSES[2], priority: 'low',
    assignees: [USERS[3], USERS[1]],
    order: 2,
  }),
];

const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-1',
  name: 'My Company',
  color: '#7B68EE',
  plan: 'business',
  members: USERS,
  spaces: [
    {
      id: 'sp-1',
      name: 'Product Development',
      color: '#7B68EE',
      icon: 'rocket_launch',
      members: USERS,
      order: 0,
      collapsed: false,
      folders: [
        {
          id: 'folder-1',
          name: 'Web App',
          color: '#0099FF',
          spaceId: 'sp-1',
          order: 0,
          collapsed: false,
          lists: [
            { id: 'list-1', name: 'Design', color: '#FF69B4', icon: 'palette', tasks: DESIGN_TASKS, statuses: DEFAULT_STATUSES, spaceId: 'sp-1', folderId: 'folder-1', order: 0 },
            { id: 'list-2', name: 'Frontend', color: '#0099FF', icon: 'code', tasks: FRONTEND_TASKS, statuses: DEFAULT_STATUSES, spaceId: 'sp-1', folderId: 'folder-1', order: 1 },
            { id: 'list-3', name: 'Backend', color: '#FF8C00', icon: 'storage', tasks: BACKEND_TASKS, statuses: DEFAULT_STATUSES, spaceId: 'sp-1', folderId: 'folder-1', order: 2 },
          ],
        },
      ],
      lists: [],
    },
    {
      id: 'sp-2',
      name: 'Marketing',
      color: '#FF69B4',
      icon: 'campaign',
      members: [USERS[0], USERS[3]],
      order: 1,
      collapsed: false,
      folders: [],
      lists: [
        { id: 'list-4', name: 'Campaigns', color: '#FF69B4', icon: 'mail', tasks: MARKETING_TASKS, statuses: DEFAULT_STATUSES, spaceId: 'sp-2', order: 0 },
      ],
    },
    {
      id: 'sp-3',
      name: 'Operations',
      color: '#00CC66',
      icon: 'settings',
      members: USERS,
      order: 2,
      collapsed: true,
      folders: [],
      lists: [
        {
          id: 'list-5', name: 'General', color: '#00CC66', tasks: [
            makeTask({ id: 't-40', name: 'Onboard new team members', listId: 'list-5', priority: 'high', assignees: [USERS[0]], order: 0 }),
            makeTask({ id: 't-41', name: 'Update company handbook', listId: 'list-5', priority: 'low', assignees: [USERS[0]], order: 1 }),
          ], statuses: DEFAULT_STATUSES, spaceId: 'sp-3', order: 0
        },
      ],
    },
  ],
};

export interface Notification {
  id: string;
  type: 'mention' | 'assigned' | 'comment' | 'status' | 'due';
  title: string;
  message: string;
  task?: Task;
  user: User;
  createdAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  readonly workspace = signal<Workspace>(INITIAL_WORKSPACE);
  readonly currentUser = signal<User>(CURRENT_USER);
  readonly allUsers = signal<User[]>(USERS);
  readonly activeListId = signal<string | null>(null);
  readonly activeSpaceId = signal<string | null>('sp-1');
  readonly activeView = signal<'list' | 'board' | 'calendar' | 'gantt' | 'table'>('list');
  readonly selectedTaskId = signal<string | null>(null);
  readonly sidebarCollapsed = signal<boolean>(false);
  readonly taskDetailOpen = signal<boolean>(false);

  readonly notifications = signal<Notification[]>([
    {
      id: 'n-1',
      type: 'mention',
      title: 'Mentioned in a comment',
      message: 'Sarah Chen mentioned you in "Design new landing page hero section"',
      user: USERS[1],
      createdAt: new Date(Date.now() - 600000),
      read: false,
    },
    {
      id: 'n-2',
      type: 'assigned',
      title: 'Task assigned to you',
      message: 'You were assigned "Accessibility audit and fixes"',
      user: USERS[1],
      createdAt: new Date(Date.now() - 1800000),
      read: false,
    },
    {
      id: 'n-3',
      type: 'due',
      title: 'Task due soon',
      message: '"Implement authentication flow" is due tomorrow',
      user: USERS[0],
      createdAt: new Date(Date.now() - 3600000),
      read: true,
    },
    {
      id: 'n-4',
      type: 'status',
      title: 'Status changed',
      message: 'Marcus Williams changed "Database query optimization" to Done',
      user: USERS[2],
      createdAt: new Date(Date.now() - 7200000),
      read: true,
    },
  ]);

  readonly unreadCount = computed(() =>
    this.notifications().filter(n => !n.read).length
  );

  readonly spaces = computed(() => this.workspace().spaces);

  getAllLists(): TaskList[] {
    const ws = this.workspace();
    const lists: TaskList[] = [];
    for (const space of ws.spaces) {
      lists.push(...space.lists);
      for (const folder of space.folders) {
        lists.push(...folder.lists);
      }
    }
    return lists;
  }

  getListById(id: string): TaskList | undefined {
    return this.getAllLists().find(l => l.id === id);
  }

  getSpaceById(id: string): Space | undefined {
    return this.workspace().spaces.find(s => s.id === id);
  }

  getAllTasks(): Task[] {
    return this.getAllLists().flatMap(l => l.tasks);
  }

  getMyTasks(): Task[] {
    const uid = this.currentUser().id;
    return this.getAllTasks().filter(t => t.assignees.some(a => a.id === uid));
  }

  getOverdueTasks(): Task[] {
    const now = new Date();
    return this.getAllTasks().filter(t =>
      t.dueDate && t.dueDate < now && t.status.type !== 'done' && t.status.type !== 'closed'
    );
  }

  getDueTodayTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getAllTasks().filter(t =>
      t.dueDate && t.dueDate >= today && t.dueDate < tomorrow
    );
  }

  getTaskById(id: string): Task | undefined {
    return this.getAllTasks().find(t => t.id === id);
  }

  updateTask(taskId: string, updates: Partial<Task>): void {
    this.workspace.update(ws => {
      const updated = { ...ws };
      updated.spaces = updated.spaces.map(space => ({
        ...space,
        lists: space.lists.map(list => ({
          ...list,
          tasks: list.tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t),
        })),
        folders: space.folders.map(folder => ({
          ...folder,
          lists: folder.lists.map(list => ({
            ...list,
            tasks: list.tasks.map(t => t.id === taskId ? { ...t, ...updates, updatedAt: new Date() } : t),
          })),
        })),
      }));
      return updated;
    });
  }

  addTask(listId: string, task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...task,
      id: `t-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.workspace.update(ws => {
      const updated = { ...ws };
      updated.spaces = updated.spaces.map(space => ({
        ...space,
        lists: space.lists.map(list =>
          list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
        ),
        folders: space.folders.map(folder => ({
          ...folder,
          lists: folder.lists.map(list =>
            list.id === listId ? { ...list, tasks: [...list.tasks, newTask] } : list
          ),
        })),
      }));
      return updated;
    });
  }

  toggleSpaceCollapsed(spaceId: string): void {
    this.workspace.update(ws => ({
      ...ws,
      spaces: ws.spaces.map(s =>
        s.id === spaceId ? { ...s, collapsed: !s.collapsed } : s
      ),
    }));
  }

  toggleFolderCollapsed(spaceId: string, folderId: string): void {
    this.workspace.update(ws => ({
      ...ws,
      spaces: ws.spaces.map(s =>
        s.id === spaceId
          ? { ...s, folders: s.folders.map(f => f.id === folderId ? { ...f, collapsed: !f.collapsed } : f) }
          : s
      ),
    }));
  }

  markNotificationRead(id: string): void {
    this.notifications.update(notifs =>
      notifs.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllNotificationsRead(): void {
    this.notifications.update(notifs => notifs.map(n => ({ ...n, read: true })));
  }

  setActiveList(listId: string): void {
    this.activeListId.set(listId);
  }

  setActiveSpace(spaceId: string): void {
    this.activeSpaceId.set(spaceId);
  }

  selectTask(taskId: string | null): void {
    this.selectedTaskId.set(taskId);
    this.taskDetailOpen.set(taskId !== null);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
