# Kanzen

**From shell to main.**

A modern Windows desktop terminal workspace built with Tauri, React, TypeScript, Vite, Tailwind CSS, and xterm.js.

Core workflow: **Terminal → Changes → Commit → Push → PR → CI → Merge**

> First version uses rich, cohesive mocks so you can experience the complete flow instantly. No real git or GitHub integration yet.

## Tech

- Tauri 2 (Windows desktop)
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- xterm.js (styled interactive PowerShell mock)
- Zustand (shared workspace state)
- Lucide icons + Sonner toasts

## Run the app

**Prerequisites (one time on Windows):**
- Node.js 20+
- Rust (rustup)
- Visual Studio C++ Build Tools ("Desktop development with C++")

```powershell
cd $env:USERPROFILE\Documents\Kanzen
npm install          # if you haven't
npm run tauri dev
```

The first run will compile the Rust backend (can take several minutes). Subsequent runs are fast.

**Note on icons (Windows dev only):**  
If `tauri dev` fails with an icon/RC2175 error, run the official icon generator once you have a 256px PNG (or use the placeholder we left in `src-tauri/icons`). This is a standard one-time step for Tauri Windows apps.

## Keyboard

- Ctrl+1 → Terminal
- Ctrl+2 → Changes
- Ctrl+3 → Pull Requests
- Ctrl+4 → Settings
- Ctrl+T (while in Terminal) → New session

All shortcuts are Ctrl (Windows), never Command.

## What you can try in v0.1

1. Terminal page
   - Multiple sessions, close, Split, Search (xterm addon)
   - Type `git status`, `git add .`, `git commit -m "..."`, `git push`, `clear`, `ls`
   - These mutate the shared mock git state → watch the Cockpit and Changes update live.

2. Changes page
   - Stage / Unstage / Discard per file or bulk
   - Click a file → see mock diff on the right
   - Write a commit message + Commit
   - Push button

3. Pull Requests
   - See current branch PR, CI checks (mix of success/pending), conversation timeline
   - "Merge pull request" with confirmation modal → state updates everywhere

4. Settings
   - Fake GitHub connect/disconnect
   - Shell placeholders (PowerShell is the active mock)
   - Security note

5. Cockpit (always visible)
   - Repo, branch (clickable switcher), changes count, ahead/behind, PR status, CI status
   - Live sync with every action

## Project structure (key paths)

```
Kanzen/
├── src-tauri/                 # Rust / Tauri host (minimal for v1)
│   ├── tauri.conf.json        # productName=Kanzen, decorations:false, window size
│   ├── capabilities/default.json
│   └── src/main.rs
├── src/
│   ├── lib/
│   │   ├── store.ts           # Zustand — single source of truth for the whole workflow
│   │   ├── types.ts
│   │   ├── mock.ts            # Seed data + dynamic git status generator + diffs
│   │   └── utils.ts           # cn()
│   ├── components/
│   │   ├── CustomTitleBar.tsx # data-tauri-drag-region + min/max/close via @tauri-apps/api/window
│   │   ├── CockpitBar.tsx     # Live status pills + branch switcher
│   │   ├── Sidebar.tsx        # Nav with Ctrl+1-4 wiring
│   │   ├── KanzenTerminal.tsx # xterm + Fit + Search + PowerShell prompt + command processor that calls store actions
│   │   ├── ui/ (Button, Badge, Modal)
│   │   ├── FileRow.tsx
│   │   └── DiffViewer.tsx
│   ├── views/
│   │   ├── TerminalView.tsx   # Tabs, new, split (grid), search bar
│   │   ├── ChangesView.tsx    # Staged/unstaged lists + right diff panel + commit composer
│   │   ├── PullRequestsView.tsx
│   │   └── SettingsView.tsx
│   ├── App.tsx                # Root layout + global keyboard + view switcher + <Toaster/>
│   └── index.css              # Full dark zinc theme + xterm container + scrollbar + component styles
├── package.json               # "tauri": "tauri" script
└── vite.config.ts             # Tailwind v4 plugin + Tauri recommended server settings (port 1420)
```

## After building (what was done)

- Full project from zero using Vite React TS scaffold + official Tauri packages + manual but standard src-tauri layout (because the interactive `create-tauri-app` wizard does not work in non-TTY harnesses).
- Every single UI element described in the request.
- Reusable components.
- Live cross-view state via one Zustand store.
- xterm.js mock that feels like a real PowerShell session and drives the rest of the app.
- Dark, rounded, professional Windows developer tool aesthetic.
- Ctrl shortcuts only.
- Mock data only (as required).

The app is ready for `npm run tauri dev` (see note about icons above if you hit the Windows resource step on first setup).

Enjoy Kanzen.
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
