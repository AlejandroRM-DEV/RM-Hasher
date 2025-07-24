use crate::services::files::FileService;

#[tauri::command]
pub async fn select_files(app_handle: tauri::AppHandle, paths: Vec<String>, algorithms: Vec<String>) -> Result<(), String> {
    FileService::process_paths(&app_handle, paths, algorithms)?;
    Ok(())
}
