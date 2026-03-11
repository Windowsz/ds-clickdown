'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  List, Kanban, Calendar, GanttChart, Table2, Filter, ArrowUpDown,
  Layers, Search, Bell, Grid3x3, ChevronDown, Check, LogOut,
  User, Keyboard, Settings, X, MessageSquare, UserPlus, Clock,
  Activity,
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { ActiveView } from '@/store/workspace-store';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const VIEWS: { id: ActiveView; Icon: React.ElementType; label: string }[] = [
  { id: 'list',     Icon: List,       label: 'List'     },
  { id: 'board',    Icon: Kanban,     label: 'Board'    },
  { id: 'calendar', Icon: Calendar,   label: 'Calendar' },
  { id: 'gantt',    Icon: GanttChart, label: 'Gantt'    },
  { id: 'table',    Icon: Table2,     label: 'Table'    },
];

const NOTIF_ICONS: Record<Notification['type'], React.ElementType> = {
  mention:  MessageSquare,
  assigned: UserPlus,
  comment:  MessageSquare,
  status:   Activity,
  due:      Clock,
};

function Avatar({ initials, color, size = 30 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.35 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
    >
      {initials}
    </span>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const {
    workspace, currentUser, notifications, activeSpaceId, activeListId,
    activeView, setActiveView,
    markNotificationRead, markAllNotificationsRead,
    getUnreadCount,
  } = useWorkspaceStore();

  const unread = getUnreadCount();
  const isSpacePage = pathname.startsWith('/space');

  // Build breadcrumb
  const space = workspace?.spaces.find(s => s.id === activeSpaceId);
  let activeList = null;
  if (activeListId && space) {
    for (const l of space.lists) { if (l.id === activeListId) { activeList = l; break; } }
    if (!activeList) {
      for (const f of space.folders) {
        for (const l of f.lists) { if (l.id === activeListId) { activeList = l; break; } }
        if (activeList) break;
      }
    }
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0 z-20 relative">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm min-w-0 flex-shrink-0">
        {space && (
          <>
            <span className="font-medium text-gray-800 truncate max-w-[120px]">{space.name}</span>
            {activeList && (
              <>
                <span className="text-gray-400">/</span>
                <span
                  className="font-medium truncate max-w-[100px]"
                  style={{ color: activeList.color }}
                >
                  {activeList.name}
                </span>
              </>
            )}
          </>
        )}
        {!space && (
          <span className="font-semibold text-gray-800 capitalize">
            {pathname.replace('/', '') || 'Home'}
          </span>
        )}
      </div>

      {/* View Switcher */}
      {isSpacePage && (
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {VIEWS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                activeView === id
                  ? 'bg-white text-[#7B68EE] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={13} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filter/Group/Sort */}
      {isSpacePage && (
        <div className="flex items-center gap-1 flex-shrink-0">
          {[
            { Icon: Filter,    label: 'Filter' },
            { Icon: Layers,    label: 'Group'  },
            { Icon: ArrowUpDown, label: 'Sort'  },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            >
              <Icon size={13} />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Right Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Search */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <Search size={16} />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setUserOpen(false); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors relative"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#7B68EE] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="font-semibold text-gray-900">Notifications</span>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#7B68EE] hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)}>
                    <X size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
                )}
                {notifications.map(n => {
                  const NIcon = NOTIF_ICONS[n.type] ?? Bell;
                  const user = useWorkspaceStore.getState().allUsers.find(u => u.id === n.userId);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={clsx(
                        'flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors',
                        !n.read && 'bg-[#7B68EE]/5'
                      )}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#7B68EE]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <NIcon size={14} className="text-[#7B68EE]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[10px] text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7B68EE] flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Apps */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
          <Grid3x3 size={16} />
        </button>

        {/* User */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => { setUserOpen(o => !o); setNotifOpen(false); }}
              className="relative w-8 h-8 rounded-full overflow-hidden"
            >
              <Avatar initials={currentUser.initials} color={currentUser.color} size={32} />
              {currentUser.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              )}
            </button>

            {userOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-sm text-gray-900">{currentUser.name}</div>
                  <div className="text-xs text-gray-500">{currentUser.email}</div>
                </div>
                <div className="py-1">
                  {[
                    { Icon: User,     label: 'My Profile'          },
                    { Icon: Settings, label: 'Settings'             },
                    { Icon: Keyboard, label: 'Keyboard Shortcuts'   },
                  ].map(({ Icon, label }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon size={15} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <LogOut size={15} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Close overlays on outside click */}
      {(notifOpen || userOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setNotifOpen(false); setUserOpen(false); }}
        />
      )}
    </header>
  );
}
