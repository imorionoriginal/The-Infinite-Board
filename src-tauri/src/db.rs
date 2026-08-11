use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CanvasElement {
    pub id: String,
    pub board_id: String,
    #[serde(rename = "type")]
    pub element_type: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub z_index: i64,
    pub title: String,
    pub content: String,
    pub color: String,
    pub is_trashed: bool,
    pub trashed_at: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateElementPayload {
    pub id: String,
    pub board_id: String,
    #[serde(rename = "type")]
    pub element_type: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub z_index: i64,
    pub title: String,
    pub content: String,
    pub color: String,
}

#[tauri::command]
pub fn get_migration_sql() -> Vec<String> {
    vec![
        "CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT 'Untitled Board', last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP)".to_string(),
        "CREATE TABLE IF NOT EXISTS elements (id TEXT PRIMARY KEY, board_id TEXT NOT NULL DEFAULT 'default', type TEXT NOT NULL, x REAL NOT NULL DEFAULT 0, y REAL NOT NULL DEFAULT 0, width REAL NOT NULL DEFAULT 240, height REAL NOT NULL DEFAULT 200, z_index INTEGER NOT NULL DEFAULT 0, title TEXT NOT NULL DEFAULT '', content TEXT NOT NULL DEFAULT '{}', color TEXT NOT NULL DEFAULT '#FEF3C7', is_trashed INTEGER NOT NULL DEFAULT 0, trashed_at DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)".to_string(),
        "CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, element_id TEXT, local_path TEXT NOT NULL, trash_path TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)".to_string(),
        "INSERT OR IGNORE INTO boards (id, name) VALUES ('default', 'My Canvas')".to_string(),
    ]
}
