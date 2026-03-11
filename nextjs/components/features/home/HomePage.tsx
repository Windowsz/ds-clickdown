'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Clock, Activity, CheckCircle2, Rocket, Megaphone, Settings, List } from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PRIORITY_CONFIG } from '@/lib/types';
import { format, isToday, isPast } from 'date-fns';

const SPACE_ICONS: Record<string, React.ElementType> = {
  rocket: Rocket, megaphone: Megaphone, settings: Settings,
};

function Avatar({ initials, color, size = 28 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.36 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
    >
      {initials}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
  if (!cfg) return null;
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ color: cfg.color, background: cfg.bgColor }}
    >
      {cfg.label}
    </span>
  );
}

function StatusDot({ color }: { color: string }) {
  return <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />;
}

export default function HomePage() {
  const router = useRouter();
  const {
    workspace, currentUser, notifications, allUsers,
    getMyTasks, getOverdueTasks, getDueTodayTasks, getAllTasks,
    setActiveList, setActiveSpace, selectTask,
  } = useWorkspaceStore();

  const myTasks     = useMemo(() => getMyTasks(),      [workspace]);
  const overdue     = useMemo(() => getOverdueTasks(),  [workspace]);
  const dueToday    = useMemo(() => getDueTodayTasks(), [workspace]);
  const allTasks    = useMemo(() => getAllTasks(),       [workspace]);
  const recentTasks = allTasks.slice(0, 8);

  const inProgress = allTasks.filter(t => t.status.type === 'in-progress').length;
  const done       = allTasks.filter(t => t.status.type === 'done').length;
  const completion = allTasks.length ? Math.round((done / allTasks.length) * 100) : 0;

  const navigateToTask = (taskId: string, listId: string) => {
    // find spaceId for listId
    if (!workspace) return;
    for (const sp of workspace.spaces) {
      for (const l of sp.lists) {
        if (l.id === listId) { setActiveSpace(sp.id); setActiveList(listId); router.push(`/space/${sp.id}/list/${listId}`); selectTask(taskId); return; }
      }
      for (const f of sp.folders) {
        for (const l of f.lists) {
          if (l.id === listId) { setActiveSpace(sp.id); setActiveList(listId); router.push(`/space/${sp.id}/list/${listId}`); selectTask(taskId); return; }
        }
      }
    }
  };

  if (!currentUser || !workspace) return null;

  const stats = [
    { label: 'Overdue',     value: overdue.length,   color: '#FF4444', Icon: AlertTriangle },
    { label: 'Due Today',   value: dueToday.length,  color: '#FF8C00', Icon: Clock         },
    { label: 'In Progress', value: inProgress,        color: '#7B68EE', Icon: Activity      },
    { label: 'Completed',   value: done,              color: '#00CC66', Icon: CheckCircle2  },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 text-white flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #7B68EE 0%, #5B48CE 100%)' }}
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Good morning, {currentUser.name.split(' ')[0]}! 👋</h1>
          <p className="text-white/70 mt-1">
            You have <strong>{myTasks.length}</strong> tasks assigned and{' '}
            <strong>{overdue.length}</strong> overdue.
          </p>
        </div>
        <Avatar initials={currentUser.initials} color="rgba(255,255,255,0.2)" size={56} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, color, Icon }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: color + '20' }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
            {label === 'Completed' && (
              <div className="ml-auto text-right">
                <div className="text-xs font-semibold text-gray-600">{completion}%</div>
                <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${completion}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Two-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* My Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">My Tasks</h2>
            <Link href="/my-work" className="text-xs text-[#7B68EE] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myTasks.slice(0, 6).length === 0 && (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No tasks assigned to you</p>
            )}
            {myTasks.slice(0, 6).map(task => (
              <div
                key={task.id}
                onClick={() => navigateToTask(task.id, task.listId)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <StatusDot color={task.status.color} />
                <span className="flex-1 text-sm text-gray-800 truncate">{task.name}</span>
                {task.dueDate && (
                  <span className={clsx('text-xs flex-shrink-0', isPast(new Date(task.dueDate)) && task.status.type !== 'done' ? 'text-red-500' : 'text-gray-400')}>
                    {isToday(new Date(task.dueDate)) ? 'Today' : format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/inbox" className="text-xs text-[#7B68EE] hover:underline">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {notifications.slice(0, 6).map(n => {
              const user = allUsers.find(u => u.id === n.userId);
              return (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3">
                  {user && <Avatar initials={user.initials} color={user.color} size={28} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#7B68EE] flex-shrink-0 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spaces Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Spaces Overview</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {workspace.spaces.map(space => {
            const SpIcon = SPACE_ICONS[space.icon ?? ''] ?? List;
            const allSpaceTasks = [...space.lists, ...space.folders.flatMap(f => f.lists)].flatMap(l => l.tasks);
            const doneCnt = allSpaceTasks.filter(t => t.status.type === 'done').length;
            const pct = allSpaceTasks.length ? Math.round((doneCnt / allSpaceTasks.length) * 100) : 0;
            const firstList = space.lists[0] ?? space.folders[0]?.lists[0];
            return (
              <div
                key={space.id}
                onClick={() => {
                  if (firstList) { setActiveSpace(space.id); setActiveList(firstList.id); router.push(`/space/${space.id}/list/${firstList.id}`); }
                  else router.push(`/space/${space.id}`);
                }}
                className="border border-gray-100 rounded-xl p-4 hover:border-[#7B68EE]/40 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: space.color + '20' }}>
                    <SpIcon size={18} style={{ color: space.color }} />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">{space.name}</div>
                    <div className="text-[10px] text-gray-400">{allSpaceTasks.length} tasks</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>{doneCnt} done</span>
                  <span className="font-medium" style={{ color: space.color }}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: space.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdue.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-red-100 bg-red-50">
            <AlertTriangle size={16} className="text-red-500" />
            <h2 className="font-semibold text-red-700">Overdue Tasks ({overdue.length})</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {overdue.slice(0, 5).map(task => (
              <div
                key={task.id}
                onClick={() => navigateToTask(task.id, task.listId)}
                className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/50 cursor-pointer transition-colors"
              >
                <StatusDot color={task.status.color} />
                <span className="flex-1 text-sm text-gray-800 truncate">{task.name}</span>
                <span className="text-xs text-red-500 flex-shrink-0">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : ''}
                </span>
                <div className="flex -space-x-1">
                  {task.assignees.slice(0, 3).map(a => (
                    <Avatar key={a.id} initials={a.initials} color={a.color} size={22} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
