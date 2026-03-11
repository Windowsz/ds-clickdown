'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CalendarDays, Briefcase } from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PRIORITY_CONFIG } from '@/lib/types';
import type { Task } from '@/lib/types';
import { format, isPast, isWithinInterval, addDays, startOfDay } from 'date-fns';

function Avatar({ initials, color, size = 26 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
    >
      {initials}
    </span>
  );
}

function TaskRow({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status.type !== 'done' && task.status.type !== 'closed';
  const cfg = PRIORITY_CONFIG[task.priority];

  return (
    <div
      onClick={() => onOpen(task)}
      className={clsx(
        'flex items-center gap-3 px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
        overdue && 'bg-red-50/40'
      )}
    >
      {/* Status dot */}
      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: task.status.color }} />

      {/* Name */}
      <span className="flex-1 text-sm text-gray-800 truncate">{task.name}</span>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1 flex-shrink-0">
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ color: task.status.color, background: task.status.color + '20' }}
        >
          {task.status.name}
        </span>
        {task.tags.slice(0, 1).map(tag => (
          <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: tag.color, background: tag.color + '20' }}>
            {tag.name}
          </span>
        ))}
      </div>

      {/* Due */}
      {task.dueDate && (
        <span className={clsx('flex items-center gap-1 text-xs flex-shrink-0', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
          {overdue && <AlertTriangle size={11} />}
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}

      {/* Priority */}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0"
        style={{ color: cfg.color, background: cfg.bgColor }}
      >
        {cfg.label}
      </span>

      {/* Assignees */}
      <div className="flex -space-x-1 flex-shrink-0">
        {task.assignees.slice(0, 3).map(a => (
          <Avatar key={a.id} initials={a.initials} color={a.color} />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="py-16 text-center">
      <Icon size={40} className="mx-auto text-gray-200 mb-3" />
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

export default function MyWorkPage() {
  const [tab, setTab] = useState<'all' | 'overdue' | 'upcoming'>('all');
  const router = useRouter();
  const { workspace, currentUser, getMyTasks, getOverdueTasks, setActiveList, setActiveSpace, selectTask } = useWorkspaceStore();

  const myTasks  = useMemo(() => getMyTasks(),     [workspace]);
  const overdue  = useMemo(() => getOverdueTasks().filter(t => t.assignees.some(a => a.id === currentUser?.id)), [workspace]);

  const upcoming = useMemo(() => {
    const today    = startOfDay(new Date());
    const in7days  = addDays(today, 7);
    return myTasks.filter(t =>
      t.dueDate &&
      isWithinInterval(new Date(t.dueDate), { start: today, end: in7days }) &&
      t.status.type !== 'done' && t.status.type !== 'closed'
    );
  }, [workspace]);

  const openTask = (task: Task) => {
    if (!workspace) return;
    for (const sp of workspace.spaces) {
      for (const l of [...sp.lists, ...sp.folders.flatMap(f => f.lists)]) {
        if (l.id === task.listId) {
          setActiveSpace(sp.id);
          setActiveList(l.id);
          router.push(`/space/${sp.id}/list/${l.id}`);
          selectTask(task.id);
          return;
        }
      }
    }
  };

  const tasks = tab === 'all' ? myTasks : tab === 'overdue' ? overdue : upcoming;

  const tabs = [
    { id: 'all'      as const, label: 'All Tasks',      count: myTasks.length  },
    { id: 'overdue'  as const, label: 'Overdue',        count: overdue.length  },
    { id: 'upcoming' as const, label: 'Upcoming (7d)',  count: upcoming.length },
  ];

  return (
    <div className="h-full flex flex-col bg-[#F5F6F8]">
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Work</h1>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                tab === t.id
                  ? 'border-[#7B68EE] text-[#7B68EE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={clsx(
                  'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  tab === t.id ? 'bg-[#7B68EE] text-white' : 'bg-gray-100 text-gray-500'
                )}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
            <span className="w-2.5 flex-shrink-0" />
            <span className="flex-1">Task</span>
            <span className="hidden md:block w-32 text-center">Status / Tag</span>
            <span className="w-16 text-center">Due</span>
            <span className="w-16 text-center">Priority</span>
            <span className="w-16 text-center">Assignee</span>
          </div>

          {tasks.length === 0 && (
            tab === 'overdue'
              ? <EmptyState icon={AlertTriangle} text="No overdue tasks — great job!" />
              : tab === 'upcoming'
                ? <EmptyState icon={CalendarDays} text="No tasks due in the next 7 days." />
                : <EmptyState icon={Briefcase}   text="No tasks assigned to you." />
          )}

          {tasks.map(task => <TaskRow key={task.id} task={task} onOpen={openTask} />)}
        </div>
      </div>
    </div>
  );
}
