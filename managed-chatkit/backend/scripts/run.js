const { spawnSync, spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const backendDir = path.resolve(__dirname, "..");
const venvDir = path.join(backendDir, ".venv");
const venvPython =
  process.platform === "win32"
    ? path.join(venvDir, "Scripts", "python.exe")
    : path.join(venvDir, "bin", "python");

function runOrThrow(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    cwd: backendDir,
    stdio: "inherit",
    env: process.env,
    ...opts,
  });

  if (result.error) {
    throw result.error;
  }
  if (typeof result.status === "number" && result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited with code ${result.status}`);
  }
}

function ensureVenv() {
  if (fs.existsSync(venvPython)) return;

  console.log(`Creating virtual env in ${venvDir} ...`);

  // Prefer Windows launcher if available.
  if (process.platform === "win32") {
    const tryPy = spawnSync("py", ["-3", "-m", "venv", ".venv"], {
      cwd: backendDir,
      stdio: "inherit",
    });
    if (tryPy.status === 0 && fs.existsSync(venvPython)) return;
  }

  runOrThrow("python", ["-m", "venv", ".venv"]);
}

function loadEnvFileIfNeeded() {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim()) return;

  const envFile = path.resolve(backendDir, "..", ".env.local");
  if (!fs.existsSync(envFile)) return;

  const raw = fs.readFileSync(envFile, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function ensureApiKey() {
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_API_KEY.trim()) {
    console.warn(
      "OPENAI_API_KEY is not set. /api/create-session and /api/kart-setup will return errors until you set it (e.g. in managed-chatkit/.env.local)."
    );
  }
}

function installDeps() {
  console.log("Installing backend deps (editable) ...");
  runOrThrow(venvPython, ["-m", "pip", "install", "-e", "."], {
    env: process.env,
  });
}

function startUvicorn() {
  const port = String(process.env.VITE_API_PORT || process.env.API_PORT || process.env.PORT || "8001");
  console.log(`Starting Managed ChatKit backend on http://127.0.0.1:${port} ...`);

  const child = spawn(
    venvPython,
    [
      "-m",
      "uvicorn",
      "--app-dir",
      backendDir,
      "app.main:app",
      "--host",
      "127.0.0.1",
      "--port",
      port,
    ],
    {
      cwd: backendDir,
      stdio: "inherit",
      env: process.env,
    }
  );

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

try {
  ensureVenv();
  loadEnvFileIfNeeded();
  ensureApiKey();
  installDeps();
  startUvicorn();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
