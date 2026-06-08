import { Terminal, GitBranch, Settings } from 'lucide-react';
import type { View } from '../lib/types';
import { cn } from '../lib/utils';
import { APP_VERSION } from '../lib/changelog';

interface SidebarProps {
  currentView: View;
  onNavigate: (v: View) => void;
}

const nav = [
  { id: 'terminal' as const, label: 'Terminal', icon: Terminal },
  { id: 'changes' as const, label: 'Changes', icon: GitBranch },
];

export function Sidebar({ currentView, onNavigate }: SidebarProps) {
  return (
    <div className="kanzen-sidebar">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img
            src="/icons.png"
            alt="Kanzen"
            className="w-8 h-8 rounded-lg ring-1 ring-zinc-700/60"
          />
          <div>
            <div className="font-semibold tracking-[-0.3px] text-lg leading-none">Kanzen</div>
            <div className="text-[10px] text-zinc-500 -mt-0.5">From shell to main.</div>
          </div>
        </div>
      </div>

      <div className="mt-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = currentView === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn('nav-item', active && 'active')}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-auto">
        <div
          onClick={() => onNavigate('settings')}
          className={cn('nav-item', currentView === 'settings' && 'active')}
        >
          <Settings size={16} />
          <span>Settings</span>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-800 mt-1">
          <img src="/icons.png" alt="" className="w-4 h-4 rounded opacity-80" />
          <span className="text-[10px] text-zinc-600">Kanzen v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
