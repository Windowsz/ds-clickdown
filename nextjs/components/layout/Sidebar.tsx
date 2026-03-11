'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Inbox, Briefcase, LayoutDashboard, Flag, Trash2, HelpCircle,
  ChevronDown, ChevronRight, Plus, Bell, Search, ChevronsLeft, ChevronsRight,
  Rocket, Megaphone, Settings, Palette, Code2, Database, Mail, List,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import { useWorkspaceStore } from '@/store/workspace-store';

// Map icon name strings (from db.json) to Lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  rocket: Rocket, megaphone: Megaphone, settings: Settings,
  palette: Palette, code: Code2, database: Database, mail: Mail,
};

function SpaceIcon({ name, color }: { name?: string; color: string }) {
  const Icon = name ? (ICON_MAP[name] ?? List) : List;
  return <Icon size={14} style={{ color }} />;
}

function Avatar({ initials, color, size = 24 }: { initials: string; color: string; size?: number }) {
  return (
    <span
      style={{ background: color, width: size, height: size, fontSize: size * 0.4 }}
      className="rounded flex items-center justify-center text-white font-semibold flex-shrink-0"
    >
      {initials}
    </span>
  );
}

const NAV_ITEMS = [
  { href: '/home',    Icon: Home,            label: 'Home'       },
  { href: '/inbox',   Icon: Inbox,           label: 'Inbox'      },
  { href: '/my-work', Icon: Briefcase,        label: 'My Work'    },
  { href: '#',        Icon: LayoutDashboard,  label: 'Dashboards' },
  { href: '#',        Icon: Flag,             label: 'Goals'      },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspace, currentUser, notifications,
    sidebarCollapsed, toggleSidebar,
    activeSpaceId, activeListId,
    setActiveSpace, setActiveList,
    toggleSpaceCollapsed, toggleFolderCollapsed,
    getUnreadCount,
  } = useWorkspaceStore();

  const unread = getUnreadCount();

  if (!workspace || !currentUser) return null;

  const navigate = (listId: string, spaceId: string) => {
    setActiveList(listId);
    setActiveSpace(spaceId);
    router.push(`/space/${spaceId}/list/${listId}`);
  };

  const navigateSpace = (spaceId: string) => {
    const space = workspace.spaces.find(s => s.id === spaceId);
    if (!space) return;
    const firstList = space.lists[0] || space.folders[0]?.lists[0];
    if (firstList) navigate(firstList.id, spaceId);
    else { setActiveSpace(spaceId); router.push(`/space/${spaceId}`); }
  };

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-[#1A1A2E] text-white transition-all duration-300 flex-shrink-0 relative',
        sidebarCollapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Workspace Header */}
      <div className="flex items-center gap-2 px-3 py-3 border-b border-white/10 min-h-[52px]">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ background: workspace.color }}
        >
          {workspace.name[0]}
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{workspace.name}</div>
            <div className="text-[10px] text-white/50 capitalize">{workspace.plan}</div>
          </div>
        )}
        {!sidebarCollapsed && (
          <div className="flex gap-1 flex-shrink-0">
            <button
              className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center relative"
              onClick={() => router.push('/inbox')}
            >
              <Bell size={13} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#7B68EE] rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </button>
            <button className="w-6 h-6 rounded hover:bg-white/10 flex items-center justify-center">
              <Plus size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 bg-white/5 rounded px-2 py-1.5 text-white/50 hover:bg-white/10 cursor-pointer">
            <Search size={12} />
            <span className="text-xs">Search…</span>
            <span className="ml-auto text-[10px] bg-white/10 px-1 rounded">⌘K</span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 space-y-0.5">
        {/* Primary Nav */}
        {NAV_ITEMS.map(({ href, Icon, label }) => {
          const active = href !== '#' && pathname.startsWith(href);
          return (
            <Link
              key={label}
              href={href}
              className={clsx(
                'flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors',
                active
                  ? 'bg-[#7B68EE]/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>{label}</span>}
              {!sidebarCollapsed && label === 'Inbox' && unread > 0 && (
                <span className="ml-auto bg-[#7B68EE] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}

        {/* Spaces */}
        {!sidebarCollapsed && (
          <div className="pt-3 pb-1 px-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Spaces</span>
              <button className="w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center">
                <Plus size={11} className="text-white/40" />
              </button>
            </div>
          </div>
        )}

        {workspace.spaces.map(space => (
          <div key={space.id}>
            {/* Space Row */}
            <div
              className={clsx(
                'flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors group',
                activeSpaceId === space.id ? 'bg-white/8 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
              onClick={() => navigateSpace(space.id)}
            >
              <span className="flex-shrink-0">
                <SpaceIcon name={space.icon} color={space.color} />
              </span>
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-sm truncate">{space.name}</span>
                  <button
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-white/10 flex items-center justify-center"
                    onClick={e => { e.stopPropagation(); toggleSpaceCollapsed(space.id); }}
                  >
                    {space.collapsed
                      ? <ChevronRight size={12} />
                      : <ChevronDown size={12} />
                    }
                  </button>
                </>
              )}
            </div>

            {/* Folders & Lists inside space */}
            {!sidebarCollapsed && !space.collapsed && (
              <div className="ml-3 border-l border-white/8 pl-2 space-y-0.5">
                {/* Direct lists */}
                {space.lists.map(list => (
                  <button
                    key={list.id}
                    onClick={() => navigate(list.id, space.id)}
                    className={clsx(
                      'w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors text-left',
                      activeListId === list.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/50 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: list.color }} />
                    <span className="truncate">{list.name}</span>
                    <span className="ml-auto text-white/30 text-[10px]">{list.tasks.length}</span>
                  </button>
                ))}

                {/* Folders */}
                {space.folders.map(folder => (
                  <div key={folder.id}>
                    <button
                      onClick={() => toggleFolderCollapsed(space.id, folder.id)}
                      className="w-full flex items-center gap-1.5 px-2 py-1 rounded text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {folder.collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                      <span className="truncate">{folder.name}</span>
                    </button>
                    {!folder.collapsed && (
                      <div className="ml-3 border-l border-white/8 pl-2 space-y-0.5">
                        {folder.lists.map(list => (
                          <button
                            key={list.id}
                            onClick={() => navigate(list.id, space.id)}
                            className={clsx(
                              'w-full flex items-center gap-2 px-2 py-1 rounded text-xs transition-colors text-left',
                              activeListId === list.id
                                ? 'bg-white/10 text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                            )}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: list.color }} />
                            <span className="truncate">{list.name}</span>
                            <span className="ml-auto text-white/30 text-[10px]">{list.tasks.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      {!sidebarCollapsed && (
        <div className="border-t border-white/10 px-2 py-2 space-y-0.5">
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
            <Trash2 size={15} />
            <span>Trash</span>
          </button>
          <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
            <HelpCircle size={15} />
            <span>Help & Docs</span>
          </button>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 w-6 h-6 bg-[#2a2a4a] border border-white/10 rounded-full flex items-center justify-center hover:bg-[#7B68EE] transition-colors z-10"
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed
          ? <ChevronsRight size={11} className="text-white" />
          : <ChevronsLeft  size={11} className="text-white" />
        }
      </button>
    </aside>
  );
}
