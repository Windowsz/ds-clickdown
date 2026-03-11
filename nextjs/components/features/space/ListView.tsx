'use client';

import { useState, useMemo } from 'react';
import { Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, MoreHorizontal, Share2, MessageSquare, Paperclip } from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PRIORITY_CONFIG, DEFAULT_STATUSES } from '@/lib/types';
import type { Task, Status } from '@/lib/types';
import { format, isPast } from 'date-fns';

function Avatar({ initials, color, size = 22 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ring-1 ring-white"
    >
      {initials}
    </span>
  );
}

function PriorityPill({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG];
  if (!cfg) return null;
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: cfg.color, background: cfg.bgColor }}>
      {cfg.label}
    </span>
  );
}

interface StatusGroupProps {
  status: Status;
  tasks: Task[];
  listId: string;
  expanded: boolean;
  onToggle: () => void;
}

function StatusGroup({ status, tasks, listId, expanded, onToggle }: StatusGroupProps) {
  const { updateTask, addTask, selectTask } = useWorkspaceStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const today = new Date();

  const markDone = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    const isDone = task.status.type === 'done';
    updateTask(task.id, { status: isDone ? DEFAULT_STATUSES[0] : DEFAULT_STATUSES[3] });
  };

  const submit = () => {
    const name = newName.trim();
    if (!name) { setAdding(false); return; }
    addTask(listId, {
      name,
      status: DEFAULT_STATUSES[0],
      priority: 'normal',
      assignees: [],
      subtasks: [],
      tags: [],
      comments: [],
      attachments: [],
      order: tasks.length,
      listId,
    });
    setNewName('');
    setAdding(false);
  };

  return (
    <div className="mb-1">
      {/* Group Header */}
      <div
        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer group sticky top-0 bg-white z-10 border-b border-gray-100"
        onClick={onToggle}
      >
        <button className="w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600">
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: status.color }} />
        <span className="text-xs font-semibold" style={{ color: status.color }}>{status.name}</span>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{tasks.length}</span>
        <div className="flex-1" />
        <button
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-xs text-[#7B68EE] px-2 py-0.5 rounded hover:bg-[#7B68EE]/10 transition-all"
          onClick={e => { e.stopPropagation(); setAdding(true); }}
        >
          <Plus size={11} /> Add task
        </button>
      </div>

      {/* Tasks */}
      {expanded && (
        <div>
          {tasks.map(task => {
            const overdue = task.dueDate && new Date(task.dueDate) < today && task.status.type !== 'done' && task.status.type !== 'closed';
            const isDone = task.status.type === 'done';

            return (
              <div
                key={task.id}
                onClick={() => selectTask(task.id)}
                className="flex items-center gap-0 px-4 py-2 hover:bg-[#F5F6F8] cursor-pointer group border-b border-gray-50 last:border-0"
              >
                {/* Checkbox */}
                <button
                  onClick={e => markDone(task, e)}
                  className="w-8 flex items-center justify-center"
                >
                  {isDone
                    ? <CheckCircle2 size={15} className="text-[#00CC66]" />
                    : <Circle      size={15} className="text-gray-300 group-hover:text-gray-400" />
                  }
                </button>

                {/* Status dot */}
                <span className="w-2.5 h-2.5 rounded-sm mr-2 flex-shrink-0" style={{ background: task.status.color }} />

                {/* Name col */}
                <div className="flex-1 min-w-0 flex items-center gap-2 mr-4">
                  <span className={clsx('text-sm truncate', isDone && 'line-through text-gray-400')}>
                    {task.name}
                  </span>
                  {task.subtasks.length > 0 && (
                    <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
                      {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                    </span>
                  )}
                  {task.comments.length > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 flex-shrink-0">
                      <MessageSquare size={10} /> {task.comments.length}
                    </span>
                  )}
                  {task.attachments.length > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400 flex-shrink-0">
                      <Paperclip size={10} /> {task.attachments.length}
                    </span>
                  )}
                </div>

                {/* Assignees col */}
                <div className="w-24 flex justify-center">
                  <div className="flex -space-x-1">
                    {task.assignees.slice(0, 3).map(a => (
                      <Avatar key={a.id} initials={a.initials} color={a.color} />
                    ))}
                  </div>
                </div>

                {/* Due date col */}
                <div className="w-24 text-center">
                  {task.dueDate && (
                    <span className={clsx('text-xs', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>

                {/* Priority col */}
                <div className="w-20 flex justify-center">
                  <PriorityPill priority={task.priority} />
                </div>

                {/* Status col */}
                <div className="w-24 flex justify-center">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ color: task.status.color, background: task.status.color + '20' }}
                  >
                    {task.status.name}
                  </span>
                </div>

                {/* Tags col */}
                <div className="w-24 flex justify-center gap-1">
                  {task.tags.slice(0, 2).map(tag => (
                    <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: tag.color, background: tag.color + '20' }}>
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Add task row */}
          {adding ? (
            <div className="flex items-center gap-2 px-12 py-2 border-b border-gray-50">
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { setAdding(false); setNewName(''); } }}
                onBlur={submit}
                placeholder="Task name..."
                className="flex-1 text-sm outline-none bg-transparent"
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 px-12 py-2 text-sm text-gray-400 hover:text-gray-600 hover:bg-gray-50 w-full transition-colors"
            >
              <Plus size={14} />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListView() {
  const { workspace, activeListId } = useWorkspaceStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['s-1', 's-2', 's-3', 's-4']));

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

  const toggle = (id: string) => setExpandedGroups(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  if (!list) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <p>Select a list from the sidebar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-white flex flex-col">
      {/* List header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
        <span className="w-3 h-3 rounded-sm" style={{ background: list.color }} />
        <h2 className="font-semibold text-gray-900">{list.name}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{list.tasks.length} tasks</span>
        <div className="flex-1" />
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <Share2 size={14} /> Share
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-0 px-4 py-2 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-400 uppercase tracking-wide sticky top-0 z-20">
        <div className="w-8" />
        <div className="w-2.5 mr-2" />
        <div className="flex-1 min-w-0 mr-4">Task Name</div>
        <div className="w-24 text-center">Assignee</div>
        <div className="w-24 text-center">Due Date</div>
        <div className="w-20 text-center">Priority</div>
        <div className="w-24 text-center">Status</div>
        <div className="w-24 text-center">Tags</div>
      </div>

      {/* Groups */}
      <div className="flex-1">
        {tasksByStatus.map(({ status, tasks }) => (
          <StatusGroup
            key={status.id}
            status={status}
            tasks={tasks}
            listId={list.id}
            expanded={expandedGroups.has(status.id)}
            onToggle={() => toggle(status.id)}
          />
        ))}
      </div>
    </div>
  );
}
