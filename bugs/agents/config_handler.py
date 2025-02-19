import json
import os
from typing import Optional, Dict
from pydantic import BaseModel

class Config(BaseModel):
    target_url: Optional[str] = None
    auto_run: bool = False

class ConfigHandler:
    def __init__(self):
        # Use absolute path to config.json in the agents directory
        self.config_file = os.path.join(os.path.dirname(__file__), "config.json")
        self._ensure_config_exists()

    def _ensure_config_exists(self):
        if not os.path.exists(self.config_file):
            self.save_config(Config(
                auto_run=False
            ))

    def load_config(self) -> Config:
        with open(self.config_file, 'r') as f:
            return Config(**json.load(f))

    def save_config(self, config: Config):
        with open(self.config_file, 'w') as f:
            json.dump(config.model_dump(), f, indent=2)

    def update_config(self, updates: Dict) -> Config:
        config = self.load_config()
        new_config = Config(**{**config.model_dump(), **updates})
        self.save_config(new_config)
        return new_config 