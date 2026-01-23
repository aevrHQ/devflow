import fs from "fs";
import path from "path";
import { homedir } from "os";

export interface DevFlowConfig {
  version: "1.0";
  platform: {
    url: string;
    api_key: string;
  };
  agent: {
    id: string;
    name: string;
    version: string;
  };
  logging: {
    level: "debug" | "info" | "warn" | "error";
    format: "json" | "text";
  };
  execution: {
    max_concurrent_tasks: number;
    timeout_seconds: number;
    cache_dir: string;
  };
}

const CONFIG_DIR = path.join(homedir(), ".devflow");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    console.log(`✓ Created ~/.devflow directory`);
  }
}

export function loadConfig(): DevFlowConfig | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf-8");
    return JSON.parse(content) as DevFlowConfig;
  } catch (error) {
    console.error("Error loading config:", error);
    return null;
  }
}

export function saveConfig(config: DevFlowConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), {
    mode: 0o600, // Only readable by owner
  });
  console.log(`✓ Saved configuration to ~/.devflow/config.json`);
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function createDefaultConfig(
  platformUrl: string,
  apiKey: string,
  agentId: string,
  agentName: string
): DevFlowConfig {
  return {
    version: "1.0",
    platform: {
      url: platformUrl,
      api_key: apiKey,
    },
    agent: {
      id: agentId,
      name: agentName,
      version: "0.1.0",
    },
    logging: {
      level: "info",
      format: "json",
    },
    execution: {
      max_concurrent_tasks: 1,
      timeout_seconds: 3600,
      cache_dir: path.join(homedir(), ".devflow", "cache"),
    },
  };
}

export function validateConfig(config: DevFlowConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.platform?.url) {
    errors.push("Missing platform.url");
  }
  if (!config.platform?.api_key) {
    errors.push("Missing platform.api_key");
  }
  if (!config.agent?.id) {
    errors.push("Missing agent.id");
  }
  if (!config.agent?.name) {
    errors.push("Missing agent.name");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
