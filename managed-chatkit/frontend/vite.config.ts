import path from "node:path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load env vars from both the frontend dir and the repo root so either
  // location works for Vite-prefixed values.
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const localEnv = loadEnv(mode, __dirname, "");
  const mergedEnv = { ...rootEnv, ...localEnv, ...process.env };

  // Ensure VITE_* vars make it into import.meta.env even when defined outside envDir.
  for (const [key, value] of Object.entries(mergedEnv)) {
    if (key.startsWith("VITE_") && typeof value === "string") {
      process.env[key] = value;
    }
  }

  const apiTarget = process.env.VITE_API_URL ?? "http://127.0.0.1:8000";

  return {
    envDir: __dirname,
    plugins: [react()],
    server: {
      port: 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
