'use client';

import { useWorkspaceStore } from '@/store/workspace-store';
import ListView from './ListView';
import BoardView from './BoardView';
import CalendarView from './CalendarView';
import TaskDetail from './TaskDetail';

export default function SpacePage() {
  const { activeView, taskDetailOpen } = useWorkspaceStore();

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeView === 'board'    && <BoardView />}
        {activeView === 'calendar' && <CalendarView />}
        {(activeView === 'list' || activeView === 'gantt' || activeView === 'table') && <ListView />}
      </div>

      {taskDetailOpen && (
        <div
          className="animate-slide-in"
          style={{
            animation: 'slideInRight 0.25s ease-out',
          }}
        >
          <TaskDetail />
        </div>
      )}
    </div>
  );
}
