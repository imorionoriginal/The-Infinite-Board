use std::fs;
use std::path::PathBuf;
use tauri::Manager;

fn get_assets_base_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(app_dir.join("assets"))
}

#[tauri::command]
pub fn ensure_directories(app: tauri::AppHandle) -> Result<String, String> {
    let base = get_assets_base_dir(&app)?;
    let imported = base.join("imported");
    let trashcan = base.join("trashcan");

    fs::create_dir_all(&imported).map_err(|e| format!("Failed to create imported dir: {}", e))?;
    fs::create_dir_all(&trashcan).map_err(|e| format!("Failed to create trashcan dir: {}", e))?;

    Ok(format!(
        "Directories created at: {}",
        base.to_string_lossy()
    ))
}

#[tauri::command]
pub fn import_asset(app: tauri::AppHandle, source_path: String) -> Result<String, String> {
    let base = get_assets_base_dir(&app)?;
    let imported_dir = base.join("imported");

    fs::create_dir_all(&imported_dir)
        .map_err(|e| format!("Failed to create imported dir: {}", e))?;

    let source = PathBuf::from(&source_path);
    let file_name = source
        .file_name()
        .ok_or_else(|| "Invalid file name".to_string())?;

    let asset_id = uuid::Uuid::new_v4().to_string();

    let dest_filename = format!("{}_{}", asset_id, file_name.to_string_lossy());
    let dest_path = imported_dir.join(&dest_filename);

    fs::copy(&source, &dest_path).map_err(|e| format!("Failed to copy file: {}", e))?;

    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn trash_asset(app: tauri::AppHandle, local_path: String) -> Result<String, String> {
    let base = get_assets_base_dir(&app)?;
    let trashcan_dir = base.join("trashcan");

    fs::create_dir_all(&trashcan_dir)
        .map_err(|e| format!("Failed to create trashcan dir: {}", e))?;

    let source = PathBuf::from(&local_path);
    if !source.exists() {
        return Err(format!("Source file does not exist: {}", local_path));
    }

    let file_name = source
        .file_name()
        .ok_or_else(|| "Invalid file name".to_string())?;

    let trash_path = trashcan_dir.join(file_name);

    fs::rename(&source, &trash_path).map_err(|e| format!("Failed to move file to trash: {}", e))?;

    Ok(trash_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn delete_asset_permanently(file_path: String) -> Result<(), String> {
    let path = PathBuf::from(&file_path);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn save_base64_asset(
    app: tauri::AppHandle,
    base64: String,
    extension: String,
) -> Result<String, String> {
    use base64::{engine::general_purpose::STANDARD, Engine as _};

    let base = get_assets_base_dir(&app)?;
    let imported_dir = base.join("imported");

    fs::create_dir_all(&imported_dir)
        .map_err(|e| format!("Failed to create imported dir: {}", e))?;

    let asset_id = uuid::Uuid::new_v4().to_string();
    let ext = if extension.starts_with('.') {
        extension
    } else {
        format!(".{}", extension)
    };
    let dest_filename = format!("{}{}", asset_id, ext);
    let dest_path = imported_dir.join(&dest_filename);

    let bytes = STANDARD
        .decode(&base64)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    fs::write(&dest_path, bytes).map_err(|e| format!("Failed to write file: {}", e))?;

    Ok(dest_path.to_string_lossy().to_string())
}

#[tauri::command]
pub fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;
    Ok(app_dir.to_string_lossy().to_string())
}
