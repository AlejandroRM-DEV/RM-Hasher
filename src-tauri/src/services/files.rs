use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use walkdir::WalkDir;

use crate::services::hashing::{compute_hash, HashAlgorithm};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct Record {
    pub path: String,
    pub sha256: Option<String>,
    pub sha512: Option<String>,
    pub sha3_256: Option<String>,
    pub sha3_512: Option<String>,
    pub sha1: Option<String>,
    pub md5: Option<String>,
    pub blake3: Option<String>,
}

impl Record {
    fn new(path: String) -> Self {
        Self {
            path,
            ..Default::default()
        }
    }

    fn set_hash(&mut self, algorithm: HashAlgorithm, hash: String) {
        match algorithm {
            HashAlgorithm::Sha256 => self.sha256 = Some(hash),
            HashAlgorithm::Sha512 => self.sha512 = Some(hash),
            HashAlgorithm::Sha3_256 => self.sha3_256 = Some(hash),
            HashAlgorithm::Sha3_512 => self.sha3_512 = Some(hash),
            HashAlgorithm::Sha1 => self.sha1 = Some(hash),
            HashAlgorithm::Md5 => self.md5 = Some(hash),
            HashAlgorithm::Blake3 => self.blake3 = Some(hash),
        }
    }
}

pub struct FileService;

impl FileService {
    pub fn process_paths(
        app_handle: &AppHandle,
        paths: Vec<String>,
        algorithms: Vec<String>,
    ) -> Result<(), String> {
        let validated_algorithms = Self::validate_algorithms(algorithms)?;
        let algorithms_arc = Arc::new(validated_algorithms);
        let app_handle_arc = Arc::new(app_handle.clone());

        paths.into_par_iter().try_for_each(|path_str| {
            Self::process_single_path(&app_handle_arc, &path_str, &algorithms_arc)
        })
    }

    fn validate_algorithms(algorithms: Vec<String>) -> Result<Vec<HashAlgorithm>, String> {
        algorithms
            .into_iter()
            .map(|algo_str| {
                HashAlgorithm::from_str(&algo_str)
                    .ok_or_else(|| format!("Unsupported algorithm: {}", algo_str))
            })
            .collect()
    }

    fn process_single_path(
        app_handle: &Arc<AppHandle>,
        path_str: &str,
        algorithms: &Arc<Vec<HashAlgorithm>>,
    ) -> Result<(), String> {
        let path = Path::new(path_str);

        let metadata = fs::metadata(path)
            .map_err(|_| format!("Path does not exist or cannot be accessed: {}", path_str))?;

        if metadata.is_file() {
            Self::process_file(app_handle, path, algorithms)
        } else if metadata.is_dir() {
            Self::process_directory(app_handle, path, algorithms)
        } else {
            Ok(())
        }
    }

    fn process_file(
        app_handle: &Arc<AppHandle>,
        file_path: &Path,
        algorithms: &Arc<Vec<HashAlgorithm>>,
    ) -> Result<(), String> {
        let hash_results: Result<Vec<_>, String> = algorithms
            .par_iter()
            .map(|&algorithm| {
                compute_hash(file_path, algorithm)
                    .map(|hash| (algorithm, hash))
                    .map_err(|e| {
                        format!(
                            "Failed to compute {:?} hash for {}: {}",
                            algorithm,
                            file_path.display(),
                            e
                        )
                    })
            })
            .collect();

        let hash_results = hash_results?;

        let mut record = Record::new(file_path.to_string_lossy().into_owned());

        for (algorithm, hash) in hash_results {
            record.set_hash(algorithm, hash);
        }

        app_handle
            .emit("file-discovered", &record)
            .map_err(|e| format!("Failed to emit event for {}: {}", file_path.display(), e))
    }

    fn process_directory(
        app_handle: &Arc<AppHandle>,
        dir_path: &Path,
        algorithms: &Arc<Vec<HashAlgorithm>>,
    ) -> Result<(), String> {
        WalkDir::new(dir_path)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .par_bridge()
            .try_for_each(|entry| Self::process_file(app_handle, entry.path(), algorithms))
    }
}
