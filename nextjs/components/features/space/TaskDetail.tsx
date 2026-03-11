'use client';

import { useState, useMemo } from 'react';
import {
  X, CheckCircle2, Circle, ChevronDown, MoreHorizontal,
  Tag, CalendarDays, User, MessageSquare, Activity, GitBranch,
  Send, Plus, Check,
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PRIORITY_CONFIG, DEFAULT_STATUSES } from '@/lib/types';
import type { Task, Status, Priority } from '@/lib/types';
import { format } from 'date-fns';

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

export default function TaskDetail() {
  const {
    workspace, selectedTaskId, currentUser, allUsers,
    selectTask, updateTask,
    taskDetailOpen,
  } = useWorkspaceStore();

  const [tab, setTab]   = useState<'subtasks' | 'comments' | 'activity'>('subtasks');
  const [comment, setComment] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [priorityMenuOpen, setPriorityMenuOpen] = useState(false);

  const task = useMemo<Task | null>(() => {
    if (!workspace || !selectedTaskId) return null;
    for (const sp of workspace.spaces) {
      for (const l of [...sp.lists, ...sp.folders.flatMap(f => f.lists)]) {
        const found = l.tasks.find(t => t.id === selectedTaskId);
        if (found) return found;
      }
    }
    return null;
  }, [workspace, selectedTaskId]);

  if (!taskDetailOpen || !task) return null;

  const isDone = task.status.type === 'done';

  const toggleDone = () => {
    updateTask(task.id, { status: isDone ? DEFAULT_STATUSES[0] : DEFAULT_STATUSES[3] });
  };

  const saveName = () => {
    if (nameVal.trim()) updateTask(task.id, { name: nameVal.trim() });
    setEditingName(false);
  };

  const setStatus = (status: Status) => {
    updateTask(task.id, { status });
    setStatusMenuOpen(false);
  };

  const setPriority = (priority: Priority) => {
    updateTask(task.id, { priority });
    setPriorityMenuOpen(false);
  };

  const addComment = () => {
    if (!comment.trim() || !currentUser) return;
    const now = new Date().toISOString();
    updateTask(task.id, {
      comments: [
        ...task.comments,
        { id: `c-${Date.now()}`, text: comment.trim(), author: currentUser, createdAt: now },
      ],
    });
    setComment('');
  };

  const toggleSubtask = (subtaskId: string) => {
    updateTask(task.id, {
      subtasks: task.subtasks.map(s =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      ),
    });
  };

  const statuses = task ? (
    (() => {
      for (const sp of workspace!.spaces) {
        for (const l of [...sp.lists, ...sp.folders.flatMap(f => f.lists)]) {
          if (l.tasks.find(t => t.id === task.id)) return l.statuses;
        }
      }
      return DEFAULT_STATUSES;
    })()
  ) : DEFAULT_STATUSES;

  const completedSubs = task.subtasks.filter(s => s.completed).length;
  const subPct = task.subtasks.length ? Math.round((completedSubs / task.subtasks.length) * 100) : 0;
  const priorityCfg = PRIORITY_CONFIG[task.priority];

  return (
    <div className="w-[480px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col h-full overflow-hidden animate-slide-in">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
        {/* Status badge */}
        <div className="relative">
          <button
            onClick={() => setStatusMenuOpen(o => !o)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium border transition-colors hover:opacity-80"
            style={{ color: task.status.color, borderColor: task.status.color + '40', background: task.status.color + '10' }}
          >
            {task.status.name}
            <ChevronDown size={11} />
          </button>
          {statusMenuOpen && (
            <div className="absolute left-0 top-9 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {statuses.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatus(s)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                  <span style={{ color: s.color }} className="font-medium">{s.name}</span>
                  {s.id === task.status.id && <Check size={12} className="ml-auto text-[#7B68EE]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mark done */}
        <button
          onClick={toggleDone}
          className={clsx(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
            isDone
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {isDone ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {isDone ? 'Completed' : 'Mark complete'}
        </button>

        <div className="flex-1" />
        <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
          <MoreHorizontal size={15} className="text-gray-400" />
        </button>
        <button
          onClick={() => selectTask(null)}
          className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
        >
          <X size={15} className="text-gray-400" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Task name */}
        <div className="px-5 py-4 border-b border-gray-100">
          {editingName ? (
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              className="text-xl font-semibold text-gray-900 w-full outline-none border-b-2 border-[#7B68EE] bg-transparent pb-1"
            />
          ) : (
            <h2
              className="text-xl font-semibold text-gray-900 cursor-text hover:text-[#7B68EE] transition-colors"
              onClick={() => { setEditingName(true); setNameVal(task.name); }}
            >
              {task.name}
            </h2>
          )}
        </div>

        {/* Meta grid */}
        <div className="px-5 py-4 grid grid-cols-2 gap-y-4 gap-x-4 border-b border-gray-100">
          {/* Assignees */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5">
              <User size={11} /> Assignees
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {task.assignees.length === 0 && (
                <span className="text-xs text-gray-300">Unassigned</span>
              )}
              {task.assignees.map(a => (
                <div key={a.id} className="flex items-center gap-1">
                  <Avatar initials={a.initials} color={a.color} size={22} />
                  <span className="text-xs text-gray-600">{a.name.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5">
              Priority
            </div>
            <div className="relative">
              <button
                onClick={() => setPriorityMenuOpen(o => !o)}
                className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg font-medium border hover:opacity-80 transition-colors"
                style={{ color: priorityCfg.color, borderColor: priorityCfg.color + '40', background: priorityCfg.bgColor }}
              >
                {priorityCfg.label}
                <ChevronDown size={10} />
              </button>
              {priorityMenuOpen && (
                <div className="absolute left-0 top-8 w-36 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([p, cfg]) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                      <span style={{ color: cfg.color }} className="font-medium">{cfg.label}</span>
                      {p === task.priority && <Check size={11} className="ml-auto text-[#7B68EE]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Due date */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5">
              <CalendarDays size={11} /> Due Date
            </div>
            <span className="text-sm text-gray-600">
              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : <span className="text-gray-300">No due date</span>}
            </span>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 mb-1.5">
              <Tag size={11} /> Tags
            </div>
            <div className="flex flex-wrap gap-1">
              {task.tags.length === 0 && <span className="text-xs text-gray-300">No tags</span>}
              {task.tags.map(tag => (
                <span key={tag.id} className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: tag.color, background: tag.color + '20' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[11px] font-medium text-gray-400 mb-2">Description</div>
          {task.description ? (
            <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
          ) : (
            <p className="text-sm text-gray-300">Add a description…</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {(['subtasks', 'comments', 'activity'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors capitalize',
                tab === t
                  ? 'border-[#7B68EE] text-[#7B68EE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t === 'subtasks'  && <GitBranch   size={12} />}
              {t === 'comments'  && <MessageSquare size={12} />}
              {t === 'activity'  && <Activity    size={12} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'subtasks' && task.subtasks.length > 0 && (
                <span className="bg-gray-100 rounded-full px-1.5 py-0.5 text-[10px] text-gray-500">{task.subtasks.length}</span>
              )}
              {t === 'comments' && task.comments.length > 0 && (
                <span className="bg-gray-100 rounded-full px-1.5 py-0.5 text-[10px] text-gray-500">{task.comments.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-5 py-4">
          {tab === 'subtasks' && (
            <div>
              {task.subtasks.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                    <span>{completedSubs}/{task.subtasks.length} completed</span>
                    <span className="font-medium text-[#7B68EE]">{subPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B68EE] rounded-full transition-all" style={{ width: `${subPct}%` }} />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {task.subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2.5">
                    <button onClick={() => toggleSubtask(sub.id)} className="flex-shrink-0">
                      {sub.completed
                        ? <CheckCircle2 size={16} className="text-[#00CC66]" />
                        : <Circle      size={16} className="text-gray-300" />
                      }
                    </button>
                    <span className={clsx('text-sm', sub.completed && 'line-through text-gray-400')}>
                      {sub.name}
                    </span>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-sm text-[#7B68EE] mt-3 hover:underline">
                <Plus size={13} /> Add subtask
              </button>
            </div>
          )}

          {tab === 'comments' && (
            <div>
              <div className="space-y-4 mb-4">
                {task.comments.map(c => {
                  const author = typeof c.author === 'object' ? c.author : allUsers.find(u => u.id === (c.author as unknown as string));
                  return (
                    <div key={c.id} className="flex items-start gap-2.5">
                      {author && <Avatar initials={author.initials} color={author.color} size={28} />}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-gray-700">{author?.name ?? 'Unknown'}</span>
                          <span className="text-[10px] text-gray-400">
                            {format(new Date(c.createdAt), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2">{c.text}</p>
                      </div>
                    </div>
                  );
                })}
                {task.comments.length === 0 && (
                  <p className="text-sm text-gray-300 text-center py-4">No comments yet</p>
                )}
              </div>

              {/* Comment input */}
              {currentUser && (
                <div className="flex items-start gap-2.5">
                  <Avatar initials={currentUser.initials} color={currentUser.color} size={28} />
                  <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#7B68EE] transition-colors">
                    <textarea
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addComment(); }}
                      placeholder="Write a comment… (Ctrl+Enter to send)"
                      rows={2}
                      className="w-full px-3 pt-2 text-sm outline-none resize-none bg-transparent"
                    />
                    <div className="flex justify-end px-2 pb-2">
                      <button
                        onClick={addComment}
                        disabled={!comment.trim()}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#7B68EE] text-white font-medium hover:bg-[#6558DD] disabled:opacity-40 transition-colors"
                      >
                        <Send size={11} /> Send
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-[#7B68EE] mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Task created</p>
                  <p className="text-[10px] text-gray-400">{format(new Date(task.createdAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Last updated</p>
                  <p className="text-[10px] text-gray-400">{format(new Date(task.updatedAt), 'MMM d, yyyy h:mm a')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close overlays */}
      {(statusMenuOpen || priorityMenuOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setStatusMenuOpen(false); setPriorityMenuOpen(false); }}
        />
      )}
    </div>
  );
}
