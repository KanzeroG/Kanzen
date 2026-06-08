export type View = 'terminal' | 'changes' | 'settings';

export interface FileChange {
  path: string;
  status: string;
  staged: boolean;
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  files: FileChange[];
}

export interface TerminalSession {
  id: string;
  title: string;
}

export interface AppState {
  // Workspace
  repoPath: string | null;
  repoName: string;
  currentBranch: string;
  branches: string[];
  changes: FileChange[];
  ahead: number;
  behind: number;

  // UI
  currentView: View;
  terminalSessions: TerminalSession[];
  activeSessionId: string;
  splitMode: boolean;

  // Settings (persisted)
  terminalFontSize: number;
  cursorBlink: boolean;
  recentFolders: string[];

  // Derived
  stagedCount: number;
  unstagedCount: number;
}

export type AppActions = {
  setView: (view: View) => void;

  // Repo
  openFolder: () => Promise<void>;
  openFolderPath: (path: string) => Promise<void>;
  removeRecentFolder: (path: string) => void;
  loadInitial: () => Promise<void>;
  refreshStatus: () => Promise<void>;

  // Settings
  setTerminalFontSize: (size: number) => void;
  setCursorBlink: (enabled: boolean) => void;

  // File actions
  stageFile: (path: string) => Promise<void>;
  unstageFile: (path: string) => Promise<void>;
  discardFile: (path: string) => Promise<void>;
  stageAll: () => Promise<void>;
  unstageAll: () => Promise<void>;

  // Commit / Push / Pull / Fetch
  commit: (message: string) => Promise<void>;
  push: () => Promise<void>;
  pull: () => Promise<void>;
  fetch: () => Promise<void>;

  // Branch
  switchBranch: (branch: string) => Promise<void>;

  // Terminal sessions
  addTerminalSession: () => void;
  setActiveSession: (id: string) => void;
  closeSession: (id: string) => void;
  setSplitMode: (enabled: boolean) => void;
};
