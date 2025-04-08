use serde::Deserialize;
use std::error::Error;
use std::path::Path;

// api config
#[derive(Debug, Deserialize)]
pub struct ApiConfig {
    pub endpoint: String,
    pub key: String,
    pub model: String,
}

// config
#[derive(Debug, Deserialize)]
pub struct Config {
    pub api: ApiConfig,
}

// load config
pub fn load_api_config() -> Result<ApiConfig, Box<dyn Error>> {
    Ok(load_from_path("config.toml")?.api)
}

pub fn load_from_path<P: AsRef<Path>>(path: P) -> Result<Config, Box<dyn Error>> {
    let settings = config::Config::builder()
        .add_source(config::File::from(path.as_ref()))
        .build()?;

    settings.try_deserialize().map_err(|e| e.into())
}