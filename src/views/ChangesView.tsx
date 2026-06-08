import { useState, useEffect } from 'react';
import { FolderOpen } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { useGitStore } from '../lib/store';
import { FileRow } from '../components/FileRow';
import { DiffViewer } from '../components/DiffViewer';
import { Button } from '../components/ui/Button';
import type { FileChange } from '../lib/types';

function rowKey(f: FileChange) {
  return `${f.staged ? 's' : 'u'}:${f.path}`;
}

export function ChangesView() {
  const {
    repoPath,
    repoName,
    changes,
    stagedCount,
    ahead,
    commit,
    push,
    stageAll,
    unstageAll,
    stageFile,
    unstageFile,
    discardFile,
    openFolder,
  } = useGitStore();

  const [selected, setSelected] = useState<FileChange | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [commitMsg, setCommitMsg] = useState('');
  const [filter, setFilter] = useState('');

  const staged = changes.filter((f) => f.staged);
  const unstaged = changes.filter((f) => !f.staged);

  const filteredStaged = staged.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase()));
  const filteredUnstaged = unstaged.filter((f) => f.path.toLowerCase().includes(filter.toLowerCase()));

  // Load the diff for the selected file whenever it (or the working tree) changes.
  useEffect(() => {
    let cancelled = false;
    if (!selected || !repoPath) {
      setDiff(null);
      return;
    }
    invoke<string>('git_diff', { cwd: repoPath, path: selected.path, staged: selected.staged })
      .then((d) => { if (!cancelled) setDiff(d); })
      .catch(() => { if (!cancelled) setDiff(null); });
    return () => { cancelled = true; };
  }, [selected, repoPath, changes]);

  // Empty state: no repo open yet.
  if (!repoPath) {
    return (
      <div className="kanzen-view" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center">
          <FolderOpen size={40} className="text-zinc-600 mx-auto mb-3" />
          <div className="text-zinc-400 mb-1">No folder open</div>
          <div className="text-xs text-zinc-500 mb-4">Open a git repository to see its changes.</div>
          <Button variant="primary" onClick={openFolder}>Open folder</Button>
        </div>
      </div>
    );
  }

  function doCommit() {
    if (!commitMsg.trim() || stagedCount === 0) return;
    commit(commitMsg.trim());
    setCommitMsg('');
  }

  return (
    <div className="kanzen-view" style={{ flexDirection: 'row' }}>
      {/* Left: list */}
      <div style={{ flex: '3', display: 'flex', flexDirection: 'column', borderRight: '1px solid #27272a', minWidth: 0 }}>
        <div className="panel-header px-4 py-2 flex items-center justify-between">
          <div className="font-medium truncate">{repoName}</div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={stageAll}>Stage all</Button>
            <Button size="sm" variant="ghost" onClick={unstageAll}>Unstage all</Button>
          </div>
        </div>

        <div className="px-3 pt-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full text-sm mb-2"
          />
        </div>

        <div className="flex-1 overflow-auto px-2 pb-3 space-y-1 text-sm">
          {filteredStaged.length > 0 && (
            <div className="px-2 pt-1 pb-0.5 text-[10px] uppercase tracking-widest text-emerald-400/70">Staged</div>
          )}
          {filteredStaged.map((f) => (
            <FileRow
              key={rowKey(f)}
              file={f}
              selected={selected ? rowKey(selected) === rowKey(f) : false}
              onSelect={setSelected}
              onStage={stageFile}
              onUnstage={unstageFile}
              onDiscard={discardFile}
            />
          ))}

          {filteredUnstaged.length > 0 && (
            <div className="px-2 pt-3 pb-0.5 text-[10px] uppercase tracking-widest text-yellow-400/70">Unstaged</div>
          )}
          {filteredUnstaged.map((f) => (
            <FileRow
              key={rowKey(f)}
              file={f}
              selected={selected ? rowKey(selected) === rowKey(f) : false}
              onSelect={setSelected}
              onStage={stageFile}
              onUnstage={unstageFile}
              onDiscard={discardFile}
            />
          ))}

          {changes.length === 0 && (
            <div className="text-center text-zinc-500 py-10">Working tree clean. Make changes in the Terminal view.</div>
          )}
        </div>

        {/* Commit box */}
        <div className="border-t border-zinc-800 p-3 bg-[#111113]">
          <textarea
            value={commitMsg}
            onChange={(e) => setCommitMsg(e.target.value)}
            placeholder="Commit message..."
            className="w-full mb-2"
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={doCommit}
              disabled={stagedCount === 0 || !commitMsg.trim()}
            >
              Commit {stagedCount} file{stagedCount === 1 ? '' : 's'}
            </Button>
            <Button variant="secondary" onClick={push}>
              Push {ahead > 0 ? `(${ahead} ahead)` : ''}
            </Button>
          </div>
        </div>
      </div>

      {/* Right: diff */}
      <div style={{ flex: '2', display: 'flex', flexDirection: 'column', padding: '12px', minHeight: 0, minWidth: 0 }}>
        <div className="font-medium mb-1 px-1 truncate">
          {selected ? selected.path : 'Diff'}
        </div>
        <div className="flex-1 min-h-0 mb-3">
          <DiffViewer diff={diff} />
        </div>

        {selected && (
          <div className="flex gap-2">
            {selected.staged ? (
              <Button variant="secondary" onClick={() => unstageFile(selected.path)}>Unstage</Button>
            ) : (
              <Button variant="secondary" onClick={() => stageFile(selected.path)}>Stage</Button>
            )}
            <Button variant="danger" onClick={() => discardFile(selected.path)}>Discard changes</Button>
          </div>
        )}
      </div>
    </div>
  );
}
