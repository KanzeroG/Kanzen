use std::process::Command;
use tauri::AppHandle;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

#[derive(serde::Serialize)]
pub struct FileChange {
    pub path: String,
    pub status: String,
    pub staged: bool,
}

#[derive(serde::Serialize)]
pub struct GitStatus {
    pub branch: String,
    pub ahead: u32,
    pub behind: u32,
    pub files: Vec<FileChange>,
}

/// Run a git command in `cwd`. Returns stdout on success, stderr (or a generic
/// message) on failure.
fn run_git(cwd: &str, args: &[&str]) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(|e| format!("failed to run git: {e}"))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        if err.trim().is_empty() {
            Err(format!("git exited with status {}", output.status))
        } else {
            Err(err.trim().to_string())
        }
    }
}

#[tauri::command]
pub fn git_cwd() -> String {
    std::env::current_dir()
        .map(|p| p.to_string_lossy().to_string())
        .unwrap_or_else(|_| String::from("."))
}

#[tauri::command]
pub fn git_is_repo(cwd: String) -> bool {
    run_git(&cwd, &["rev-parse", "--is-inside-work-tree"])
        .map(|s| s.trim() == "true")
        .unwrap_or(false)
}

/// Parse the porcelain `## ` branch header, e.g.
/// `## main...origin/main [ahead 1, behind 2]`
fn parse_branch_header(line: &str) -> (String, u32, u32) {
    let body = line.trim_start_matches("## ").trim();

    // Branch name is everything up to "..." or the first space / bracket.
    let branch_part = body.split("...").next().unwrap_or(body);
    let branch = branch_part
        .split_whitespace()
        .next()
        .unwrap_or("")
        .to_string();

    let mut ahead = 0u32;
    let mut behind = 0u32;

    if let (Some(start), Some(end)) = (body.find('['), body.find(']')) {
        let inside = &body[start + 1..end];
        for part in inside.split(',') {
            let part = part.trim();
            if let Some(n) = part.strip_prefix("ahead ") {
                ahead = n.trim().parse().unwrap_or(0);
            } else if let Some(n) = part.strip_prefix("behind ") {
                behind = n.trim().parse().unwrap_or(0);
            }
        }
    }

    // Detached HEAD shows up as "(no branch)" / "HEAD (no branch)".
    let branch = if branch.is_empty() || body.starts_with("HEAD") {
        "HEAD".to_string()
    } else {
        branch
    };

    (branch, ahead, behind)
}

#[tauri::command]
pub fn git_status(cwd: String) -> Result<GitStatus, String> {
    let out = run_git(&cwd, &["status", "--porcelain=v1", "--branch"])?;

    let mut branch = String::from("HEAD");
    let mut ahead = 0u32;
    let mut behind = 0u32;
    let mut files: Vec<FileChange> = Vec::new();

    for line in out.lines() {
        if line.starts_with("## ") {
            let (b, a, be) = parse_branch_header(line);
            branch = b;
            ahead = a;
            behind = be;
            continue;
        }
        if line.len() < 3 {
            continue;
        }

        // XY <path>  (X = index/staged, Y = worktree/unstaged)
        let x = line.as_bytes()[0] as char;
        let y = line.as_bytes()[1] as char;
        let mut path = line[3..].to_string();

        // Renames/copies show "old -> new"; keep the new path.
        if let Some(idx) = path.find(" -> ") {
            path = path[idx + 4..].to_string();
        }
        // Strip the surrounding quotes git adds for paths with special chars.
        if path.starts_with('"') && path.ends_with('"') && path.len() >= 2 {
            path = path[1..path.len() - 1].to_string();
        }

        if x == '?' && y == '?' {
            files.push(FileChange {
                path,
                status: "??".to_string(),
                staged: false,
            });
            continue;
        }

        // A file can be both staged and unstaged; surface it as two rows so the
        // UI can stage/unstage each part independently.
        if x != ' ' && x != '?' {
            files.push(FileChange {
                path: path.clone(),
                status: x.to_string(),
                staged: true,
            });
        }
        if y != ' ' && y != '?' {
            files.push(FileChange {
                path,
                status: y.to_string(),
                staged: false,
            });
        }
    }

    Ok(GitStatus {
        branch,
        ahead,
        behind,
        files,
    })
}

#[tauri::command]
pub fn git_diff(cwd: String, path: String, staged: bool) -> Result<String, String> {
    if staged {
        run_git(&cwd, &["diff", "--cached", "--", &path])
    } else {
        let diff = run_git(&cwd, &["diff", "--", &path])?;
        if diff.trim().is_empty() {
            // Untracked file: show its contents as added lines.
            match std::fs::read_to_string(std::path::Path::new(&cwd).join(&path)) {
                Ok(content) => {
                    let body: String = content
                        .lines()
                        .map(|l| format!("+{l}"))
                        .collect::<Vec<_>>()
                        .join("\n");
                    Ok(format!("diff --git a/{path} b/{path}\n@@ (untracked) @@\n{body}"))
                }
                Err(_) => Ok(diff),
            }
        } else {
            Ok(diff)
        }
    }
}

#[tauri::command]
pub fn git_stage(cwd: String, path: String) -> Result<(), String> {
    run_git(&cwd, &["add", "--", &path]).map(|_| ())
}

#[tauri::command]
pub fn git_unstage(cwd: String, path: String) -> Result<(), String> {
    run_git(&cwd, &["restore", "--staged", "--", &path]).map(|_| ())
}

#[tauri::command]
pub fn git_discard(cwd: String, path: String) -> Result<(), String> {
    // Tracked changes: restore from HEAD. If that fails (untracked file),
    // delete the file from disk.
    match run_git(&cwd, &["restore", "--", &path]) {
        Ok(_) => Ok(()),
        Err(_) => {
            let full = std::path::Path::new(&cwd).join(&path);
            std::fs::remove_file(full).map_err(|e| e.to_string())
        }
    }
}

#[tauri::command]
pub fn git_stage_all(cwd: String) -> Result<(), String> {
    run_git(&cwd, &["add", "-A"]).map(|_| ())
}

#[tauri::command]
pub fn git_unstage_all(cwd: String) -> Result<(), String> {
    run_git(&cwd, &["reset"]).map(|_| ())
}

#[tauri::command]
pub fn git_commit(cwd: String, message: String) -> Result<String, String> {
    run_git(&cwd, &["commit", "-m", &message])
}

#[tauri::command]
pub fn git_push(cwd: String) -> Result<String, String> {
    // git push writes its progress to stderr even on success, so combine.
    let output = Command::new("git")
        .args(["push"])
        .current_dir(&cwd)
        .output()
        .map_err(|e| format!("failed to run git: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined = format!("{stdout}{stderr}").trim().to_string();

    if output.status.success() {
        Ok(if combined.is_empty() {
            "Pushed.".to_string()
        } else {
            combined
        })
    } else {
        Err(if combined.is_empty() {
            "git push failed".to_string()
        } else {
            combined
        })
    }
}

/// Run a git command that writes progress to stderr (fetch/pull/push), returning
/// the combined stdout+stderr on success, or that combined text as the error.
fn run_git_combined(cwd: &str, args: &[&str], empty_ok: &str) -> Result<String, String> {
    let output = Command::new("git")
        .args(args)
        .current_dir(cwd)
        .output()
        .map_err(|e| format!("failed to run git: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    let combined = format!("{stdout}{stderr}").trim().to_string();

    if output.status.success() {
        Ok(if combined.is_empty() { empty_ok.to_string() } else { combined })
    } else {
        Err(if combined.is_empty() { format!("git {} failed", args[0]) } else { combined })
    }
}

#[tauri::command]
pub fn git_fetch(cwd: String) -> Result<String, String> {
    run_git_combined(&cwd, &["fetch", "--all", "--prune"], "Fetched.")
}

#[tauri::command]
pub fn git_pull(cwd: String) -> Result<String, String> {
    run_git_combined(&cwd, &["pull"], "Already up to date.")
}

#[tauri::command]
pub fn git_branches(cwd: String) -> Result<Vec<String>, String> {
    let out = run_git(&cwd, &["branch", "--format=%(refname:short)"])?;
    Ok(out
        .lines()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .collect())
}

#[tauri::command]
pub fn git_checkout(cwd: String, branch: String) -> Result<(), String> {
    run_git(&cwd, &["checkout", &branch]).map(|_| ())
}

#[tauri::command]
pub async fn pick_folder(app: AppHandle) -> Option<String> {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog()
        .file()
        .pick_folder(move |f| {
            let _ = tx.send(f);
        });
    rx.recv().ok().flatten().map(|p| p.to_string())
}

/// Native confirm dialog for destructive actions. Returns true if the user
/// chose the destructive (first) button. The button label doubles as the verb.
#[tauri::command]
pub async fn confirm(app: AppHandle, message: String, title: String, ok_label: String) -> bool {
    let (tx, rx) = std::sync::mpsc::channel();
    app.dialog()
        .message(message)
        .title(title)
        .buttons(MessageDialogButtons::OkCancelCustom(ok_label, "Cancel".into()))
        .show(move |ok| {
            let _ = tx.send(ok);
        });
    rx.recv().unwrap_or(false)
}
