# Changelog

All notable changes to Kanzen are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] — 2026-06-09

### Added
- Auto-updater with secure signed updates delivered through GitHub Releases.
- Release CI now signs Windows installers (NSIS + MSI) for verified auto-updates.

## [0.3.0] — 2026-06-08

### Added
- **Fetch** and **Pull** buttons in the cockpit bar (`git fetch --all --prune` / `git pull`).
- A native **confirmation dialog** before discarding a file's changes.
- The Kanzen **app icon** in the sidebar, Settings, and the window / taskbar / installer.

### Changed
- Cleaner **Settings** layout with the explanatory clutter removed.
- File rows now give a **press response** and a clearer selected state (left accent bar).

## [0.2.0] — 2026-06-08

### Added
- **Real git backend** — the Changes view and cockpit now run actual `git` (status, diff, stage, commit, push, branch switch) via the Rust side instead of in-memory mock state.
- **Folder picker** — open any git repository from the cockpit; the chosen folder drives both the git views and the terminal's working directory.
- **Settings view** — terminal font size and cursor blink, applied live and persisted.
- **Recent repositories** — quickly reopen folders you have worked in; the most recent one reopens automatically on launch.
- **In-app changelog** ("What's New") and an **About** panel, reachable from the sidebar.

### Changed
- Trimmed the UI to two focused views: **Terminal** and **Changes**.

### Fixed
- Terminal session numbering no longer reuses a number after a session is closed.
- Buttons, tabs, and cockpit pills now give a tactile press response when clicked.

### Removed
- The mock Pull Requests view, fake CI checks, and "Connect GitHub (demo)" flow. Pull-request work is done with `gh`/`git` directly in the real terminal.

## [0.1.0] — 2026-06-01

### Added
- Real PTY terminal (PowerShell) via Tauri, with session tabs and split panes.
- Initial workspace shell: custom title bar, cockpit bar, and sidebar navigation.
- Mock-driven Changes and Pull Requests views to prototype the workflow.

[0.3.1]: https://github.com/KanzeroG/Kanzen/releases/tag/v0.3.1
[0.3.0]: https://github.com/KanzeroG/Kanzen/releases/tag/v0.3.0
[0.2.0]: https://github.com/KanzeroG/Kanzen/releases/tag/v0.2.0
[0.1.0]: https://github.com/KanzeroG/Kanzen/releases/tag/v0.1.0
