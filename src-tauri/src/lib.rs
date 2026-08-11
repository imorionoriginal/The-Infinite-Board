mod db;
mod fs_manager;
mod trash_worker;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            db::get_migration_sql,
            fs_manager::ensure_directories,
            fs_manager::import_asset,
            fs_manager::trash_asset,
            fs_manager::delete_asset_permanently,
            fs_manager::save_base64_asset,
            fs_manager::get_app_data_dir,
            trash_worker::cleanup_expired_trash,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
