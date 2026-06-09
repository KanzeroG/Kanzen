import { Minus, Square, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGitStore } from '../lib/store';

// Safe check for running inside Tauri (prevents crashes in plain browser dev at localhost:1420)
const isTauri =
  typeof window !== 'undefined' &&
  (
    (window as any).__TAURI_INTERNALS__ !== undefined ||
    (window as any).__TAURI__ !== undefined
  );

export function CustomTitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [winApi, setWinApi] = useState<any>(null);
  const repoPath = useGitStore((s) => s.repoPath);

  useEffect(() => {
    if (!isTauri) return; // Do nothing in browser

    // Lazy get the window API
    const loadWin = async () => {
      try {
        const mod = await import('@tauri-apps/api/window');
        const win = mod.getCurrentWindow();
        setWinApi(win);

        const unlisten = await win.onResized(async () => {
          try {
            const maximized = await win.isMaximized();
            setIsMaximized(maximized);
          } catch {}
        });

        const initialMax = await win.isMaximized();
        setIsMaximized(initialMax);

        return () => {
          if (unlisten) unlisten();
        };
      } catch (e) {
        console.warn('Tauri window API not available', e);
      }
    };

    loadWin();
  }, []);

  const handleMinimize = () => {
    if (winApi && winApi.minimize) winApi.minimize();
  };

  const handleToggleMax = () => {
    if (winApi && winApi.toggleMaximize) winApi.toggleMaximize();
  };

  const handleClose = () => {
    if (winApi && winApi.close) winApi.close();
  };

  // In browser (localhost), show a simple non-draggable header for debugging
  const titleStyle = { 
    backgroundColor: '#0a0a0b', 
    height: '32px',
    color: '#e4e4e7'
  };

  return (
    <div 
      className="titlebar flex items-center justify-between px-3 select-none" 
      data-tauri-drag-region={isTauri ? true : undefined}
      style={titleStyle}
    >
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold tracking-tight">Kanzen</span>
        {repoPath && <span className="text-[10px] text-zinc-500">• {repoPath}</span>}
        {!isTauri && <span className="ml-2 text-[10px] bg-yellow-900 px-1 rounded">BROWSER MODE</span>}
      </div>

      {/* Only show window controls in real Tauri app */}
      {isTauri && (
        <div className="controls flex gap-1">
          <button
            onClick={handleMinimize}
            title="Minimize"
            className="w-8 h-6 flex items-center justify-center hover:bg-zinc-800 rounded"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={handleToggleMax}
            title={isMaximized ? 'Restore' : 'Maximize'}
            className="w-8 h-6 flex items-center justify-center hover:bg-zinc-800 rounded"
          >
            <Square size={13} />
          </button>
          <button
            onClick={handleClose}
            title="Close"
            className="w-8 h-6 flex items-center justify-center hover:bg-red-900 rounded"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
