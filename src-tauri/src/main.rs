// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod git;
mod pty;

use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::Mutex;
use tauri::Manager;

fn main() {
  let pty_map: pty::PtyMap = Arc::new(Mutex::new(HashMap::new()));

  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .manage(pty_map)
    .setup(|app| {
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.center();
        let _ = window.set_background_color(Some(tauri::window::Color(10, 10, 11, 255)));
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      pty::pty_spawn,
      pty::pty_write,
      pty::pty_resize,
      pty::pty_kill,
      git::git_cwd,
      git::git_is_repo,
      git::git_status,
      git::git_diff,
      git::git_stage,
      git::git_unstage,
      git::git_discard,
      git::git_stage_all,
      git::git_unstage_all,
      git::git_commit,
      git::git_push,
      git::git_fetch,
      git::git_pull,
      git::git_branches,
      git::git_checkout,
      git::pick_folder,
      git::confirm,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
