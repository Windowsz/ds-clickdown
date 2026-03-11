'use client';

import { useMemo } from 'react';
import { Plus, MoreHorizontal, CalendarDays, GitBranch } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PRIORITY_CONFIG, DEFAULT_STATUSES } from '@/lib/types';
import type { Task, Status } from '@/lib/types';
import { format, isPast } from 'date-fns';

function Avatar({ initials, color, size = 20 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-1 ring-white"
    >
      {initials}
    </span>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const { selectTask } = useWorkspaceStore();
  const cfg = PRIORITY_CONFIG[task.priority];
  const overdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status.type !== 'done' && task.status.type !== 'closed';

  return (
    <div
      onClick={() => selectTask(task.id)}
      className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-0.5 group"
    >
      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: tag.color, background: tag.color + '20' }}>
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Name */}
      <p className="text-sm text-gray-800 font-medium mb-3 leading-snug">{task.name}</p>

      {/* Footer */}
      <div className="flex items-center gap-2">
        {/* Priority */}
        <span
          className="text-[10px] px-1.5 py-0.5 rounded font-medium"
          style={{ color: cfg.color, background: cfg.bgColor }}
        >
          {cfg.label}
        </span>

        {/* Due date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 text-[10px] ${overdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            <CalendarDays size={10} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <GitBranch size={10} />
            {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
          </span>
        )}

        <div className="flex-1" />

        {/* Assignees */}
        <div className="flex -space-x-1">
          {task.assignees.slice(0, 3).map(a => (
            <Avatar key={a.id} initials={a.initials} color={a.color} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ColumnProps {
  status: Status;
  tasks: Task[];
  listId: string;
}

function KanbanColumn({ status, tasks, listId }: ColumnProps) {
  const { addTask } = useWorkspaceStore();

  const handleAdd = () => {
    const name = window.prompt('Task name:');
    if (!name?.trim()) return;
    addTask(listId, {
      name: name.trim(),
      status,
      priority: 'normal',
      assignees: [],
      subtasks: [],
      tags: [],
      comments: [],
      attachments: [],
      order: tasks.length,
      listId,
    });
  };

  return (
    <div className="flex-shrink-0 w-72 flex flex-col rounded-xl bg-[#F5F6F8] border border-gray-200">
      {/* Column header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: status.color }} />
        <span className="text-xs font-semibold text-gray-700 flex-1">{status.name}</span>
        <span className="text-xs text-gray-400 bg-white rounded-full px-2 py-0.5 border">{tasks.length}</span>
        <button
          onClick={handleAdd}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors"
        >
          <Plus size={13} className="text-gray-400" />
        </button>
        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors">
          <MoreHorizontal size={13} className="text-gray-400" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {tasks.map(task => <KanbanCard key={task.id} task={task} />)}
      </div>

      {/* Add task button */}
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors border-t border-gray-200 rounded-b-xl"
      >
        <Plus size={14} />
        Add task
      </button>
    </div>
  );
}

export default function BoardView() {
  const { workspace, activeListId } = useWorkspaceStore();

  const list = useMemo(() => {
    if (!workspace || !activeListId) return null;
    for (const sp of workspace.spaces) {
      for (const l of [...sp.lists, ...sp.folders.flatMap(f => f.lists)]) {
        if (l.id === activeListId) return l;
      }
    }
    return null;
  }, [workspace, activeListId]);

  const tasksByStatus = useMemo(() => {
    if (!list) return [];
    const map = new Map<string, Task[]>();
    list.statuses.forEach(s => map.set(s.id, []));
    list.tasks.forEach(t => {
      const bucket = map.has(t.status.id) ? t.status.id : 's-1';
      map.get(bucket)!.push(t);
    });
    return list.statuses.map(s => ({ status: s, tasks: map.get(s.id) ?? [] }));
  }, [list]);

  if (!list) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Select a list from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex gap-4 h-full min-h-0 pb-4">
        {tasksByStatus.map(({ status, tasks }) => (
          <KanbanColumn key={status.id} status={status} tasks={tasks} listId={list.id} />
        ))}
        {/* Add column */}
        <button className="flex-shrink-0 w-72 h-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-400 hover:border-[#7B68EE] hover:text-[#7B68EE] transition-colors">
          <Plus size={16} />
          Add column
        </button>
      </div>
    </div>
  );
}
