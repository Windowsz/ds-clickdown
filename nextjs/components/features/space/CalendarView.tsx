'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, format,
} from 'date-fns';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { Task } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalDay {
  date: Date;
  isCurrentMonth: boolean;
  tasks: Task[];
}

export default function CalendarView() {
  const [current, setCurrent] = useState(new Date());
  const { workspace, selectTask } = useWorkspaceStore();

  const allTasks = useMemo(() => {
    if (!workspace) return [];
    return workspace.spaces.flatMap(sp =>
      [...sp.lists, ...sp.folders.flatMap(f => f.lists)].flatMap(l => l.tasks)
    ).filter(t => t.dueDate);
  }, [workspace]);

  const calDays = useMemo<CalDay[]>(() => {
    const start = startOfWeek(startOfMonth(current));
    const end   = endOfWeek(endOfMonth(current));
    return eachDayOfInterval({ start, end }).map(date => ({
      date,
      isCurrentMonth: isSameMonth(date, current),
      tasks: allTasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date)),
    }));
  }, [current, allTasks]);

  const prev = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday = () => setCurrent(new Date());

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 bg-[#F5F6F8]">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <button onClick={prev} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 w-40 text-center">
              {format(current, 'MMMM yyyy')}
            </h2>
            <button onClick={next} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm text-[#7B68EE] border border-[#7B68EE] rounded-lg hover:bg-[#7B68EE]/10 transition-colors"
          >
            Today
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex-1 grid grid-cols-7 overflow-auto">
          {calDays.map(({ date, isCurrentMonth, tasks }) => {
            const today = isToday(date);
            return (
              <div
                key={date.toISOString()}
                className={`min-h-[100px] p-2 border-r border-b border-gray-100 last:border-r-0 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                {/* Day number */}
                <div className="flex justify-end mb-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      today
                        ? 'bg-[#7B68EE] text-white'
                        : isCurrentMonth
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-0.5">
                  {tasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      onClick={() => selectTask(task.id)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-white cursor-pointer hover:opacity-80 transition-opacity truncate"
                      style={{ background: task.status.color }}
                      title={task.name}
                    >
                      <span className="truncate">{task.name}</span>
                    </div>
                  ))}
                  {tasks.length > 3 && (
                    <div className="text-[10px] text-gray-400 px-1 font-medium">
                      +{tasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
