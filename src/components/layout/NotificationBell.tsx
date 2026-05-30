import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, X, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export default function NotificationBell() {
  const { items, unread, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="relative p-2 rounded-lg hover:bg-white/5 transition-colors outline-none">
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 bg-card/95 backdrop-blur-xl border-white/10">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <p className="font-display font-semibold text-sm">Notifications</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-gold flex items-center gap-1 hover:underline">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            items.map(n => {
              const inner = (
                <div className={`px-4 py-3 border-b border-white/5 flex gap-3 ${!n.is_read ? 'bg-gold/5' : ''}`}>
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? 'bg-gold' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!n.is_read && (
                      <button onClick={(e) => { e.preventDefault(); markRead(n.id); }} className="p-1 rounded hover:bg-white/10" title="Mark read">
                        <Check className="h-3.5 w-3.5 text-gold" />
                      </button>
                    )}
                    <button onClick={(e) => { e.preventDefault(); remove(n.id); }} className="p-1 rounded hover:bg-white/10" title="Delete">
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
              return n.link ? (
                <Link key={n.id} to={n.link} onClick={() => { markRead(n.id); setOpen(false); }} className="block">{inner}</Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
