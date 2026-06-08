export const APP_VERSION = '0.2.0';

export type ChangeKind = 'added' | 'changed' | 'fixed' | 'removed';

export interface ChangelogEntry {
  version: string;
  date: string; // ISO date
  title?: string;
  changes: { kind: ChangeKind; text: string }[];
}

// Newest first. This is the single source of truth for the in-app "What's New"
// panel; keep CHANGELOG.md in sync with it.
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-06-08',
    title: 'Real git',
    changes: [
      { kind: 'added', text: 'Real git backend — Changes view and cockpit now run actual git (status, diff, stage, commit, push, branch switch).' },
      { kind: 'added', text: 'Folder picker — open any git repository; it drives both the git views and the terminal working directory.' },
      { kind: 'added', text: 'Settings: terminal font size and cursor blink, applied live.' },
      { kind: 'added', text: 'Recent repositories — quickly reopen folders you have worked in; the last one reopens on launch.' },
      { kind: 'added', text: 'In-app changelog ("What\'s New") and an About panel.' },
      { kind: 'changed', text: 'Trimmed the UI to two focused views: Terminal and Changes.' },
      { kind: 'fixed', text: 'Terminal session numbering no longer reuses numbers after a session is closed.' },
      { kind: 'fixed', text: 'Buttons, tabs, and pills now give a tactile press response when clicked.' },
      { kind: 'removed', text: 'Removed the mock Pull Requests view, fake CI checks, and "Connect GitHub (demo)" theater.' },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-01',
    title: 'First prototype',
    changes: [
      { kind: 'added', text: 'Real PTY terminal (PowerShell) via Tauri, with session tabs and split panes.' },
      { kind: 'added', text: 'Initial workspace shell: title bar, cockpit bar, sidebar navigation.' },
      { kind: 'added', text: 'Mock-driven Changes and Pull Requests views to prototype the workflow.' },
    ],
  },
];
