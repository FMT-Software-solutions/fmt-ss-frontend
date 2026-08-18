import { NavLink, useLocation } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui';
import { NAV_GROUPS } from '@/lib/navigation';
import { useUiStore } from '@/stores/ui-store';
import { Logo } from '@/components/shared/Logo';

function isPathActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AppSidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        'sticky top-0 flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex h-14 items-center border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-2',
        )}
      >
        <Logo className={collapsed ? 'h-6' : 'h-8'} />
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto p-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {!collapsed && (
              <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const active = isPathActive(pathname, item.to);

              // A plain string className is required here: when collapsed the
              // link becomes a Tooltip trigger via asChild, and Radix's Slot
              // merges className as a string — a NavLink render-prop function
              // would be stringified into garbage classes.
              const link = (
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
                    collapsed && 'justify-center',
                    active
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </NavLink>
              );

              // The collapsed rail hides labels, so surface them on hover.
              return collapsed ? (
                <Tooltip key={item.to} delayDuration={0}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              ) : (
                <div key={item.to}>{link}</div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-4 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
