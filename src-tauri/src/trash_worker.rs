use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn get_trashcan_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(app_dir.join("assets").join("trashcan"))
}

#[tauri::command]
pub fn cleanup_expired_trash(
    app: tauri::AppHandle,
    file_paths: Vec<String>,
) -> Result<u32, String> {
    let mut deleted_count: u32 = 0;

    for file_path in &file_paths {
        let path = PathBuf::from(file_path);
        if path.exists() {
            match fs::remove_file(&path) {
                Ok(_) => {
                    deleted_count += 1;
                    println!("🗑️ Deleted expired trash file: {}", file_path);
                }
                Err(e) => {
                    eprintln!("⚠️ Failed to delete trash file {}: {}", file_path, e);
                }
            }
        }
    }

    let trashcan_dir = get_trashcan_dir(&app)?;
    if trashcan_dir.exists() {
        if let Ok(entries) = fs::read_dir(&trashcan_dir) {
            let three_days_ago =
                std::time::SystemTime::now() - std::time::Duration::from_secs(72 * 60 * 60);

            for entry in entries.flatten() {
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        if modified < three_days_ago {
                            if let Err(e) = fs::remove_file(entry.path()) {
                                eprintln!(
                                    "⚠️ Failed to delete orphaned trash file {:?}: {}",
                                    entry.path(),
                                    e
                                );
                            } else {
                                deleted_count += 1;
                                println!("🗑️ Deleted orphaned trash file: {:?}", entry.path());
                            }
                        }
                    }
                }
            }
        }
    }

    println!(
        "✅ Trash cleanup completed: {} files deleted",
        deleted_count
    );
    Ok(deleted_count)
}
