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
    <div 
      className="kanzen-sidebar"
    >
      <div className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-zinc-800 flex items-center justify-center">
            <Terminal size={16} className="text-blue-400" />
          </div>
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

      <div className="mt-auto border-t border-zinc-800 pt-1">
        <div
          onClick={() => onNavigate('settings')}
          className={cn('nav-item', currentView === 'settings' && 'active')}
        >
          <Settings size={16} />
          <span className="flex-1">Settings</span>
          <span className="text-[10px] text-zinc-600">v{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
}
