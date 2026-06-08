import { GitBranch, ArrowUp, ArrowDown, FolderOpen, RefreshCw } from 'lucide-react';
import { useGitStore } from '../lib/store';
import { useState } from 'react';

export function CockpitBar() {
  const {
    repoName,
    repoPath,
    currentBranch,
    branches,
    changes,
    ahead,
    behind,
    switchBranch,
    openFolder,
    refreshStatus,
  } = useGitStore();

  const [branchOpen, setBranchOpen] = useState(false);
  const changeCount = changes.length;

  return (
    <div
      className="cockpit flex items-center px-4 text-xs gap-3 select-none border-b border-zinc-800"
      style={{ backgroundColor: '#111113', height: '40px', borderBottom: '1px solid #27272a' }}
    >
      {/* Repo */}
      <button
        onClick={openFolder}
        className="pill hover:bg-zinc-800 font-medium"
        title={repoPath || 'Open a folder'}
      >
        <FolderOpen size={13} className="text-zinc-400" />
        <span>{repoName || 'Open folder'}</span>
      </button>

      {repoPath && (
        <>
          {/* Branch */}
          <div className="relative">
            <button
              onClick={() => setBranchOpen(!branchOpen)}
              className="pill hover:bg-zinc-800"
              disabled={branches.length === 0}
            >
              <GitBranch size={13} />
              <span className="font-mono">{currentBranch || '—'}</span>
            </button>

            {branchOpen && branches.length > 0 && (
              <div className="absolute top-8 left-0 z-50 bg-zinc-900 border border-zinc-800 rounded-lg py-1 text-xs shadow-xl min-w-[180px] max-h-64 overflow-auto">
                {branches.map((b) => (
                  <div
                    key={b}
                    onClick={() => {
                      switchBranch(b);
                      setBranchOpen(false);
                    }}
                    className={`px-3 py-1.5 cursor-pointer hover:bg-zinc-800 flex items-center gap-2 ${b === currentBranch ? 'text-blue-400' : ''}`}
                  >
                    <GitBranch size={12} /> {b}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Changes */}
          <div className="pill">
            <span>{changeCount} change{changeCount === 1 ? '' : 's'}</span>
          </div>

          {/* Ahead / Behind */}
          <div className="pill">
            <ArrowUp size={12} className="text-emerald-400" /> {ahead}
            <ArrowDown size={12} className="text-amber-400 ml-1" /> {behind}
          </div>

          {/* Refresh */}
          <button onClick={refreshStatus} className="pill hover:bg-zinc-800" title="Refresh status">
            <RefreshCw size={12} />
          </button>
        </>
      )}

      <div className="flex-1" />

      <div className="text-[10px] text-zinc-600">From shell to main.</div>
    </div>
  );
}
