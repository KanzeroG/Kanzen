import { Minus, Plus, FolderOpen, X, Terminal as TerminalIcon } from 'lucide-react';
import { useGitStore } from '../lib/store';
import { Button } from '../components/ui/Button';
import { CHANGELOG, APP_VERSION, type ChangeKind } from '../lib/changelog';

const kindStyles: Record<ChangeKind, { label: string; cls: string }> = {
  added: { label: 'Added', cls: 'text-emerald-400 bg-emerald-400/10' },
  changed: { label: 'Changed', cls: 'text-blue-400 bg-blue-400/10' },
  fixed: { label: 'Fixed', cls: 'text-amber-400 bg-amber-400/10' },
  removed: { label: 'Removed', cls: 'text-red-400 bg-red-400/10' },
};

function basename(p: string): string {
  const parts = p.replace(/[\\/]+$/, '').split(/[\\/]/);
  return parts[parts.length - 1] || p;
}

export function SettingsView() {
  const {
    terminalFontSize,
    cursorBlink,
    setTerminalFontSize,
    setCursorBlink,
    recentFolders,
    repoPath,
    openFolderPath,
    removeRecentFolder,
  } = useGitStore();

  return (
    <div className="kanzen-view" style={{ overflowY: 'auto' }}>
      <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 className="text-lg font-semibold mb-1">Settings</h2>
          <p className="text-xs text-zinc-500">Preferences are saved on this machine.</p>
        </div>

        {/* Terminal */}
        <div className="panel p-4">
          <div className="font-medium mb-3 flex items-center gap-2">
            <TerminalIcon size={15} className="text-blue-400" /> Terminal
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm">Font size</div>
              <div className="text-xs text-zinc-500">Applied live to all terminals.</div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => setTerminalFontSize(terminalFontSize - 1)}>
                <Minus size={14} />
              </Button>
              <span className="font-mono text-sm w-8 text-center">{terminalFontSize}</span>
              <Button size="sm" variant="secondary" onClick={() => setTerminalFontSize(terminalFontSize + 1)}>
                <Plus size={14} />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-zinc-800">
            <div>
              <div className="text-sm">Cursor blink</div>
              <div className="text-xs text-zinc-500">Blink the terminal cursor.</div>
            </div>
            <button
              role="switch"
              aria-checked={cursorBlink}
              onClick={() => setCursorBlink(!cursorBlink)}
              className={`relative w-10 h-5 rounded-full transition-colors ${cursorBlink ? 'bg-blue-500' : 'bg-zinc-700'}`}
            >
              <span
                className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ transform: cursorBlink ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </div>

        {/* Recent repositories */}
        <div className="panel p-4">
          <div className="font-medium mb-3 flex items-center gap-2">
            <FolderOpen size={15} className="text-blue-400" /> Recent repositories
          </div>
          {recentFolders.length === 0 ? (
            <p className="text-sm text-zinc-500">No repositories yet. Open a folder from the cockpit bar.</p>
          ) : (
            <div className="space-y-1">
              {recentFolders.map((path) => (
                <div
                  key={path}
                  className={`file-row text-sm ${path === repoPath ? 'selected' : ''}`}
                  onClick={() => openFolderPath(path)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{basename(path)}</div>
                    <div className="truncate text-[11px] text-zinc-500 font-mono">{path}</div>
                  </div>
                  {path === repoPath && <span className="text-[10px] text-emerald-400 mr-2">open</span>}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeRecentFolder(path); }}
                    className="text-zinc-500 hover:text-red-400 p-1"
                    title="Remove from list"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What's New */}
        <div className="panel p-4">
          <div className="font-medium mb-3">What's New</div>
          <div className="space-y-5">
            {CHANGELOG.map((entry) => (
              <div key={entry.version}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-mono text-sm text-blue-400">v{entry.version}</span>
                  {entry.title && <span className="text-sm font-medium">{entry.title}</span>}
                  <span className="text-[11px] text-zinc-500">{entry.date}</span>
                </div>
                <ul className="space-y-1.5">
                  {entry.changes.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 mt-0.5 ${kindStyles[c.kind].cls}`}>
                        {kindStyles[c.kind].label}
                      </span>
                      <span className="text-zinc-300">{c.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="panel p-4">
          <div className="font-medium mb-2">About</div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-zinc-800 flex items-center justify-center">
              <TerminalIcon size={18} className="text-blue-400" />
            </div>
            <div>
              <div className="font-semibold">Kanzen <span className="text-xs text-zinc-500 font-normal">v{APP_VERSION}</span></div>
              <div className="text-xs text-zinc-500">From shell to main. — a terminal-first git workspace for Windows.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
