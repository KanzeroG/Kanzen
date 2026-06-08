import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { toast } from 'sonner';
import type { AppState, AppActions, View, GitStatus, FileChange } from './types';

interface Store extends AppState, AppActions {}

function basename(p: string): string {
  const norm = p.replace(/[\\/]+$/, '');
  const parts = norm.split(/[\\/]/);
  return parts[parts.length - 1] || norm;
}

function deriveCounts(files: FileChange[]) {
  return {
    stagedCount: files.filter((f) => f.staged).length,
    unstagedCount: files.filter((f) => !f.staged).length,
  };
}

// ---- Persisted settings (localStorage) ----
const LS = {
  fontSize: 'kanzen.terminalFontSize',
  cursorBlink: 'kanzen.cursorBlink',
  recent: 'kanzen.recentFolders',
};

const MAX_RECENT = 8;

function loadNumber(key: string, fallback: number): number {
  const v = Number(localStorage.getItem(key));
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

function loadBool(key: string, fallback: boolean): boolean {
  const v = localStorage.getItem(key);
  return v === null ? fallback : v === 'true';
}

function loadRecent(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(LS.recent) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

const initialSessions = [{ id: 's1', title: 'Session 1' }];

export const useGitStore = create<Store>((set, get) => {
  // Monotonic session number — never reused, even after sessions are closed.
  let sessionCounter = initialSessions.length;

  return {
  // State
  repoPath: null,
  repoName: '',
  currentBranch: '',
  branches: [],
  changes: [],
  ahead: 0,
  behind: 0,

  currentView: 'terminal',
  terminalSessions: [...initialSessions],
  activeSessionId: 's1',
  splitMode: false,

  terminalFontSize: loadNumber(LS.fontSize, 13),
  cursorBlink: loadBool(LS.cursorBlink, true),
  recentFolders: loadRecent(),

  stagedCount: 0,
  unstagedCount: 0,

  // ---- UI ----
  setView: (view: View) => set({ currentView: view }),

  // ---- Repo ----
  openFolder: async () => {
    try {
      const path = await invoke<string | null>('pick_folder');
      if (!path) return;
      await get().openFolderPath(path);
    } catch (e) {
      toast.error(String(e));
    }
  },

  openFolderPath: async (path: string) => {
    try {
      const isRepo = await invoke<boolean>('git_is_repo', { cwd: path });
      if (!isRepo) {
        toast.error('That folder is not a git repository');
        get().removeRecentFolder(path);
        return;
      }

      // Record in recent folders (most-recent first, de-duped, capped).
      const recent = [path, ...get().recentFolders.filter((p) => p !== path)].slice(0, MAX_RECENT);
      localStorage.setItem(LS.recent, JSON.stringify(recent));

      set({ repoPath: path, repoName: basename(path), recentFolders: recent });
      await get().refreshStatus();
      toast.success(`Opened ${basename(path)}`);
    } catch (e) {
      toast.error(String(e));
    }
  },

  removeRecentFolder: (path: string) => {
    const recent = get().recentFolders.filter((p) => p !== path);
    localStorage.setItem(LS.recent, JSON.stringify(recent));
    set({ recentFolders: recent });
  },

  loadInitial: async () => {
    // Prefer reopening the most recent folder; fall back to the launch dir.
    const candidates: string[] = [];
    const recent = get().recentFolders;
    if (recent[0]) candidates.push(recent[0]);
    try {
      candidates.push(await invoke<string>('git_cwd'));
    } catch {
      // ignore
    }

    for (const path of candidates) {
      try {
        const isRepo = await invoke<boolean>('git_is_repo', { cwd: path });
        if (isRepo) {
          set({ repoPath: path, repoName: basename(path) });
          await get().refreshStatus();
          return;
        }
      } catch {
        // try next candidate
      }
    }
  },

  // ---- Settings ----
  setTerminalFontSize: (size: number) => {
    const clamped = Math.max(9, Math.min(24, Math.round(size)));
    localStorage.setItem(LS.fontSize, String(clamped));
    set({ terminalFontSize: clamped });
  },

  setCursorBlink: (enabled: boolean) => {
    localStorage.setItem(LS.cursorBlink, String(enabled));
    set({ cursorBlink: enabled });
  },

  refreshStatus: async () => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      const [status, branches] = await Promise.all([
        invoke<GitStatus>('git_status', { cwd: repoPath }),
        invoke<string[]>('git_branches', { cwd: repoPath }),
      ]);
      set({
        currentBranch: status.branch,
        ahead: status.ahead,
        behind: status.behind,
        changes: status.files,
        branches,
        ...deriveCounts(status.files),
      });
    } catch (e) {
      toast.error(String(e));
    }
  },

  // ---- File actions ----
  stageFile: async (path: string) => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      await invoke('git_stage', { cwd: repoPath, path });
      await get().refreshStatus();
    } catch (e) {
      toast.error(String(e));
    }
  },

  unstageFile: async (path: string) => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      await invoke('git_unstage', { cwd: repoPath, path });
      await get().refreshStatus();
    } catch (e) {
      toast.error(String(e));
    }
  },

  discardFile: async (path: string) => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      await invoke('git_discard', { cwd: repoPath, path });
      await get().refreshStatus();
      toast(`Discarded changes in ${basename(path)}`);
    } catch (e) {
      toast.error(String(e));
    }
  },

  stageAll: async () => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      await invoke('git_stage_all', { cwd: repoPath });
      await get().refreshStatus();
    } catch (e) {
      toast.error(String(e));
    }
  },

  unstageAll: async () => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      await invoke('git_unstage_all', { cwd: repoPath });
      await get().refreshStatus();
    } catch (e) {
      toast.error(String(e));
    }
  },

  // ---- Commit / Push ----
  commit: async (message: string) => {
    const { repoPath, stagedCount } = get();
    if (!repoPath || stagedCount === 0 || !message.trim()) return;
    try {
      await invoke<string>('git_commit', { cwd: repoPath, message });
      await get().refreshStatus();
      toast.success(`Committed “${message.slice(0, 40)}”`);
    } catch (e) {
      toast.error(String(e));
    }
  },

  push: async () => {
    const { repoPath } = get();
    if (!repoPath) return;
    try {
      const result = await invoke<string>('git_push', { cwd: repoPath });
      await get().refreshStatus();
      toast.success(result.split('\n').pop() || 'Pushed');
    } catch (e) {
      toast.error(String(e));
    }
  },

  // ---- Branch ----
  switchBranch: async (branch: string) => {
    const { repoPath, currentBranch } = get();
    if (!repoPath || branch === currentBranch) return;
    try {
      await invoke('git_checkout', { cwd: repoPath, branch });
      await get().refreshStatus();
      toast.success(`Switched to ${branch}`);
    } catch (e) {
      toast.error(String(e));
    }
  },

  // ---- Terminal sessions ----
  addTerminalSession: () => {
    const { terminalSessions } = get();
    sessionCounter += 1;
    const newSession = { id: `s${Date.now()}`, title: `Session ${sessionCounter}` };
    set({
      terminalSessions: [...terminalSessions, newSession],
      activeSessionId: newSession.id,
    });
  },

  setActiveSession: (id: string) => set({ activeSessionId: id }),

  closeSession: (id: string) => {
    const { terminalSessions, activeSessionId } = get();
    if (terminalSessions.length <= 1) return; // keep at least one

    const filtered = terminalSessions.filter((s) => s.id !== id);
    const newActive = activeSessionId === id ? filtered[0].id : activeSessionId;
    set({ terminalSessions: filtered, activeSessionId: newActive });
  },

  setSplitMode: (enabled: boolean) => set({ splitMode: enabled }),
  };
});
