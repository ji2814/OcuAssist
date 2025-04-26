use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::Path;
use std::fs;
use toml;

// api config
#[derive(Debug, Deserialize, Serialize)]
pub struct ApiConfig {
    pub endpoint: String,
    pub key: String,
    pub model: String,
}

// config
#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub api: ApiConfig,
}

// load config
use config;
use std::path::PathBuf;

pub fn load_api_config() -> Result<ApiConfig, Box<dyn Error>> {
    let config_path = PathBuf::from("config.toml");

    Ok(load_from_path(config_path)?.api)
}

pub fn save_api_config(config: &ApiConfig) -> Result<(), Box<dyn Error>> {
    let config_path = PathBuf::from("config.toml");

    let toml = toml::to_string_pretty(&Config {
        api: ApiConfig {
            endpoint: config.endpoint.clone(),
            key: config.key.clone(),
            model: config.model.clone(),
        },
    })?;
    
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)?;
    }
    fs::write(config_path, toml)?;
    Ok(())
}

pub fn load_from_path<P: AsRef<Path>>(path: P) -> Result<Config, Box<dyn Error>> {
    let settings = config::Config::builder()
        .add_source(config::File::from(path.as_ref()))
        .build()?;

    settings.try_deserialize().map_err(|e| e.into())
}