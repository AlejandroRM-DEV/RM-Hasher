use blake3;
use hex::encode as hex_encode;
use md5::Md5;
use sha1::Sha1;
use sha2::{Digest as Sha2Digest, Sha256, Sha512};
use sha3::{Digest as Sha3Digest, Sha3_256, Sha3_512};
use std::{
    fs::File,
    io::{BufReader, Read},
    path::Path,
};

#[derive(Debug, Clone, Copy)]
pub enum HashAlgorithm {
    Sha256,
    Sha512,
    Sha3_256,
    Sha3_512,
    Sha1,
    Md5,
    Blake3,
}

impl HashAlgorithm {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "blake3" => Some(HashAlgorithm::Blake3),
            "sha256" => Some(HashAlgorithm::Sha256),
            "sha512" => Some(HashAlgorithm::Sha512),
            "sha3_256" => Some(HashAlgorithm::Sha3_256),
            "sha3_512" => Some(HashAlgorithm::Sha3_512),
            "sha1" => Some(HashAlgorithm::Sha1),
            "md5" => Some(HashAlgorithm::Md5),
            _ => None,
        }
    }
}

pub fn compute_hash(path: &Path, algorithm: HashAlgorithm) -> Result<String, String> {
    match algorithm {
        HashAlgorithm::Sha256 => compute_sha2::<Sha256>(path),
        HashAlgorithm::Sha512 => compute_sha2::<Sha512>(path),
        HashAlgorithm::Sha3_256 => compute_sha3::<Sha3_256>(path),
        HashAlgorithm::Sha3_512 => compute_sha3::<Sha3_512>(path),
        HashAlgorithm::Sha1 => compute_sha1(path),
        HashAlgorithm::Md5 => compute_md5(path),
        HashAlgorithm::Blake3 => compute_blake3(path),
    }
}

fn compute_sha2<H: Sha2Digest + Default>(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open {}: {}", path.display(), e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = H::default();
    let mut buf = [0u8; 8 * 1024];

    loop {
        let n = reader
            .read(&mut buf)
            .map_err(|e| format!("Read error {}: {}", path.display(), e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Ok(hex_encode(hasher.finalize()))
}

fn compute_sha3<H: Sha3Digest + Default>(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open {}: {}", path.display(), e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = H::default();
    let mut buf = [0u8; 8 * 1024];

    loop {
        let n = reader
            .read(&mut buf)
            .map_err(|e| format!("Read error {}: {}", path.display(), e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Ok(hex_encode(hasher.finalize()))
}

fn compute_sha1(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open {}: {}", path.display(), e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha1::new();
    let mut buf = [0u8; 8 * 1024];

    loop {
        let n = reader
            .read(&mut buf)
            .map_err(|e| format!("Read error {}: {}", path.display(), e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Ok(hex_encode(hasher.finalize()))
}

fn compute_md5(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open {}: {}", path.display(), e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = Md5::new();
    let mut buf = [0u8; 8 * 1024];

    loop {
        let n = reader
            .read(&mut buf)
            .map_err(|e| format!("Read error {}: {}", path.display(), e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Ok(hex_encode(hasher.finalize()))
}

fn compute_blake3(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|e| format!("Failed to open {}: {}", path.display(), e))?;
    let mut reader = BufReader::new(file);
    let mut hasher = blake3::Hasher::new();
    let mut buf = [0u8; 8 * 1024];

    loop {
        let n = reader
            .read(&mut buf)
            .map_err(|e| format!("Read error {}: {}", path.display(), e))?;
        if n == 0 {
            break;
        }
        hasher.update(&buf[..n]);
    }

    Ok(hasher.finalize().to_hex().to_string())
}
