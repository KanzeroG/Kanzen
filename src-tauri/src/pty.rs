use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::Arc;
use parking_lot::Mutex;
use portable_pty::{native_pty_system, CommandBuilder, MasterPty, PtySize};
use tauri::ipc::Channel;
use tauri::{AppHandle, Emitter, State};
use uuid::Uuid;

pub struct PtySession {
    pub writer: Box<dyn Write + Send>,
    pub master: Box<dyn MasterPty + Send>,
    pub killer: Box<dyn portable_pty::Child + Send>,
}

// All fields are Send, so PtySession is Send
unsafe impl Send for PtySession {}

pub type PtyMap = Arc<Mutex<HashMap<String, PtySession>>>;

fn detect_shell() -> String {
    if cfg!(target_os = "windows") {
        // Prefer PowerShell 7 (pwsh), fall back to built-in PowerShell 5.1
        let pwsh_ok = std::process::Command::new("pwsh")
            .arg("--version")
            .output()
            .map(|o| o.status.success())
            .unwrap_or(false);
        if pwsh_ok {
            "pwsh".to_string()
        } else {
            "powershell".to_string()
        }
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/zsh".to_string())
    }
}

#[tauri::command]
pub fn pty_spawn(
    app: AppHandle,
    sessions: State<'_, PtyMap>,
    id: Option<String>,
    cols: u16,
    rows: u16,
    cwd: Option<String>,
    on_data: Channel<String>,
) -> Result<String, String> {
    let session_id = id.unwrap_or_else(|| Uuid::new_v4().to_string());

    let pty_system = native_pty_system();
    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let shell = detect_shell();
    let mut cmd = CommandBuilder::new(&shell);

    let work_dir = cwd.clone().unwrap_or_else(|| {
        std::env::current_dir()
            .map(|p| p.to_string_lossy().to_string())
            .unwrap_or_else(|_| "C:\\".to_string())
    });
    cmd.cwd(&work_dir);

    let child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;

    // Drop the slave side after spawning — keeps it from blocking on EOF
    drop(pair.slave);

    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;
    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;

    let session = PtySession {
        writer,
        master: pair.master,
        killer: child,
    };

    sessions.lock().insert(session_id.clone(), session);

    // Reader thread: stream PTY output to the webview over a low-latency IPC
    // Channel (much faster than the global event bus for high-frequency data).
    let app_r = app.clone();
    let sid_r = session_id.clone();
    let sessions_r = Arc::clone(sessions.inner());

    std::thread::spawn(move || {
        let mut buf = [0u8; 8192];
        let mut incomplete: Vec<u8> = Vec::new();

        loop {
            match reader.read(&mut buf) {
                Ok(0) | Err(_) => break,
                Ok(n) => {
                    let mut data = incomplete.clone();
                    data.extend_from_slice(&buf[..n]);
                    incomplete.clear();

                    match std::str::from_utf8(&data) {
                        Ok(s) => {
                            let _ = on_data.send(s.to_string());
                        }
                        Err(e) => {
                            let valid = e.valid_up_to();
                            if valid > 0 {
                                if let Ok(s) = std::str::from_utf8(&data[..valid]) {
                                    let _ = on_data.send(s.to_string());
                                }
                            }
                            incomplete = data[valid..].to_vec();
                        }
                    }
                }
            }
        }

        // Process exited — clean up and notify frontend
        sessions_r.lock().remove(&sid_r);
        let _ = app_r.emit(&format!("pty://exit/{}", sid_r), ());
    });

    Ok(session_id)
}

#[tauri::command]
pub fn pty_write(
    sessions: State<'_, PtyMap>,
    id: String,
    data: String,
) -> Result<(), String> {
    let mut map = sessions.lock();
    if let Some(s) = map.get_mut(&id) {
        s.writer.write_all(data.as_bytes()).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn pty_resize(
    sessions: State<'_, PtyMap>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let map = sessions.lock();
    if let Some(s) = map.get(&id) {
        s.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn pty_kill(sessions: State<'_, PtyMap>, id: String) -> Result<(), String> {
    let mut map = sessions.lock();
    if let Some(mut s) = map.remove(&id) {
        let _ = s.killer.kill();
    }
    Ok(())
}
