<div align="center">

<img src="public/icons.png" alt="Kanzen" width="120" height="120" />

# Kanzen

**From shell to main.**

A terminal-first git workspace for Windows that pairs a **real PowerShell terminal** with a **real git UI** in one fast, focused window.

[![Release](https://img.shields.io/github/v/release/KanzeroG/Kanzen?label=release&color=8b5cf6)](https://github.com/KanzeroG/Kanzen/releases)
![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Built with](https://img.shields.io/badge/built%20with-Tauri%202-24C8DB)

<img src="public/first.gif" alt="Kanzen in action" width="820" />

</div>

---

## Download

**Latest:** [v0.3.0](https://github.com/KanzeroG/Kanzen/releases/latest)

### Windows (x64)

- **[Kanzen_0.3.0_x64-setup.exe](https://github.com/KanzeroG/Kanzen/releases/download/v0.3.0/Kanzen_0.3.0_x64-setup.exe)** — Recommended NSIS installer
- [Kanzen_0.3.0_x64_en-US.msi](https://github.com/KanzeroG/Kanzen/releases/download/v0.3.0/Kanzen_0.3.0_x64_en-US.msi) — Windows Installer (MSI)

Older releases and checksums are on the [Releases page](https://github.com/KanzeroG/Kanzen/releases).

> **Note:** Kanzen is currently focused on Windows (real PowerShell + git). Linux and macOS builds are provided experimentally.

---

## Features

- **Real PTY terminal** — a genuine PowerShell session (prefers `pwsh`, falls back to Windows PowerShell) running in the chosen repo. Multiple sessions, tabs, and split panes.
- **Real git** — Changes view and cockpit run actual `git`: status, per-file diff, stage/unstage, commit, push, pull, fetch, and branch switching. No mocks.
- **Folder picker** — open any git repository; it drives both the git views and the terminal's working directory.
- **Recent repositories** — quickly reopen folders you've worked in; the last one reopens on launch.
- **Settings** — terminal font size and cursor blink, applied live and persisted.
- **In-app changelog** ("What's New") and About panel.

> Pull-request work is intentionally done with `gh`/`git` directly in the real terminal — no separate GitHub integration to keep out of sync.

## Tech

- **Tauri 2** — Windows desktop host (Rust + WebView2)
- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** + pure-CSS structural layout
- **xterm.js** with a native PTY backend (`portable-pty`), streamed over a Tauri `Channel`
- **Zustand** for state, **Lucide** icons, **Sonner** toasts
- **tauri-plugin-dialog** for the native folder picker

---

## Install & run

### Download & install (recommended for most users)

1. Go to the [latest release](https://github.com/KanzeroG/Kanzen/releases/latest).
2. Download `Kanzen_..._x64-setup.exe`.
3. Run the installer and launch Kanzen.

The app will remember your last repository and open it on next launch.

### Development

**Prerequisites (Windows)**

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://rustup.rs/) (via `rustup`)
- **Visual Studio C++ Build Tools** — "Desktop development with C++" workload
- **WebView2 Runtime** — preinstalled on Windows 11; [download](https://developer.microsoft.com/microsoft-edge/webview2/) if missing
- **git** on your `PATH` (required at runtime)

```powershell
cd $env:USERPROFILE\Documents\Kanzen
npm install
npm run tauri dev
```

The first run compiles the Rust backend (a few minutes). Subsequent runs are fast and support hot-reload for the frontend.

### Build from source

```powershell
npm run tauri build
```

This produces installers under `src-tauri/target/release/bundle/`:

- `nsis/Kanzen_<version>_x64-setup.exe`
- `msi/Kanzen_<version>_x64_en-US.msi`

The raw executable is at `src-tauri/target/release/kanzen.exe`.

Releases are built automatically by GitHub Actions when a new version tag (e.g. `v0.4.0`) is pushed.

---

## Usage

1. **Open a repository** — click the folder button (top-left of the cockpit bar) and pick any git repo. The terminal opens there and the cockpit fills with the real branch and ahead/behind counts. Your most recent repo reopens automatically next launch.
2. **Terminal** — run anything you'd run in PowerShell: `git`, `gh`, `npm`, build scripts. Use tabs and Split for parallel sessions.
3. **Changes** — see real modified/untracked files; click one to view its `git diff`. Stage/unstage individually or in bulk, write a commit message, **Commit**, then **Push**. Fetch and Pull live in the cockpit.
4. **Branches** — the cockpit branch dropdown lists real branches; selecting one runs `git checkout`.
5. **Settings** — adjust terminal font size / cursor blink, manage recent repositories, and read the changelog.

### Keyboard

| Shortcut | Action |
|---|---|
| `Ctrl+1` | Terminal |
| `Ctrl+2` | Changes |
| `Ctrl+,` | Settings |
| `Ctrl+T` | New terminal session (in Terminal) |

All shortcuts use Ctrl (Windows-style), never Command.

---

## Project structure

```
Kanzen/
├── src-tauri/                  # Rust / Tauri host
│   ├── src/
│   │   ├── main.rs             # App setup, plugin + command registration
│   │   ├── pty.rs              # Native PTY: spawn/write/resize/kill, streams output over a Channel
│   │   └── git.rs              # git_* commands + folder picker + confirm dialog
│   ├── capabilities/default.json
│   ├── tauri.conf.json
│   └── Cargo.toml
├── src/
│   ├── lib/
│   │   ├── store.ts            # Zustand — async git actions + persisted settings
│   │   ├── types.ts
│   │   ├── changelog.ts        # APP_VERSION + structured changelog (drives "What's New")
│   │   └── utils.ts
│   ├── components/
│   │   ├── CustomTitleBar.tsx  # Custom window chrome (min/max/close, drag region)
│   │   ├── CockpitBar.tsx      # Repo / branch / ahead-behind / open-folder / fetch / pull
│   │   ├── Sidebar.tsx         # Terminal · Changes nav + Settings button
│   │   ├── KanzenTerminal.tsx  # xterm + PTY bridge (Tauri Channel + invoke)
│   │   ├── FileRow.tsx, DiffViewer.tsx
│   │   └── ui/ (Button, Badge)
│   ├── views/
│   │   ├── TerminalView.tsx    # Tabs, new session, split panes
│   │   ├── ChangesView.tsx     # Staged/unstaged lists + diff panel + commit composer
│   │   └── SettingsView.tsx    # Terminal · Recent repos · What's New · About
│   ├── App.tsx                 # Layout + shortcuts + view switcher
│   └── index.css               # Dark theme + structural .kanzen-* layout classes
├── CHANGELOG.md
├── package.json
└── vite.config.ts
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md). Current version: **0.3.0**.

## Contributing

Issues and pull requests are welcome. If you're hacking on the terminal/PTY or git integration, please test on real repositories.

---

**Made for people who live in the terminal but still want a great git experience.**