'use client';

import { useState } from 'react';
import { MessageSquare, UserPlus, Clock, Activity, Bell, Check } from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';
import type { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

const NOTIF_ICONS: Record<Notification['type'], { Icon: React.ElementType; color: string; bg: string }> = {
  mention:  { Icon: MessageSquare, color: '#7B68EE', bg: '#7B68EE20' },
  assigned: { Icon: UserPlus,      color: '#0099FF', bg: '#0099FF20' },
  comment:  { Icon: MessageSquare, color: '#FF8C00', bg: '#FF8C0020' },
  status:   { Icon: Activity,      color: '#00CC66', bg: '#00CC6620' },
  due:      { Icon: Clock,         color: '#FF4444', bg: '#FF444420' },
};

function Avatar({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.35 }}
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
    >
      {initials}
    </span>
  );
}

function NotifRow({ n }: { n: Notification }) {
  const { allUsers, markNotificationRead } = useWorkspaceStore();
  const user = allUsers.find(u => u.id === n.userId);
  const cfg = NOTIF_ICONS[n.type] ?? NOTIF_ICONS.mention;

  return (
    <div
      onClick={() => markNotificationRead(n.id)}
      className={clsx(
        'flex items-start gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
        !n.read && 'bg-[#7B68EE]/5'
      )}
    >
      {user ? (
        <Avatar initials={user.initials} color={user.color} />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell size={16} className="text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
            <cfg.Icon size={11} style={{ color: cfg.color }} />
          </div>
          <span className="text-sm font-medium text-gray-900">{n.title}</span>
        </div>
        <p className="text-sm text-gray-600">{n.message}</p>
        <p className="text-xs text-gray-400 mt-1">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>
      </div>
      {!n.read && (
        <span className="w-2.5 h-2.5 rounded-full bg-[#7B68EE] flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const { notifications, markAllNotificationsRead, getUnreadCount } = useWorkspaceStore();

  const unread = getUnreadCount();
  const filtered = tab === 'unread' ? notifications.filter(n => !n.read) : notifications;

  return (
    <div className="h-full flex flex-col bg-[#F5F6F8]">
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Inbox</h1>
          {unread > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1.5 text-sm text-[#7B68EE] hover:bg-[#7B68EE]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Check size={14} />
              Mark all as read
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {(['all', 'unread'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize',
                tab === t
                  ? 'border-[#7B68EE] text-[#7B68EE]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {t}
              {t === 'unread' && unread > 0 && (
                <span className="ml-1.5 bg-[#7B68EE] text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white max-w-2xl mx-auto mt-4 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Bell size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">
                {tab === 'unread' ? 'All caught up! No unread notifications.' : 'No notifications yet.'}
              </p>
            </div>
          ) : (
            filtered.map(n => <NotifRow key={n.id} n={n} />)
          )}
        </div>
      </div>
    </div>
  );
}
