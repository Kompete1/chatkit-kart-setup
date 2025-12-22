import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Allow Vite env vars from either repo root or frontend/.env.* files.
  const rootEnv = loadEnv(mode, path.resolve(__dirname, ".."), "");
  const localEnv = loadEnv(mode, __dirname, "");
  const env = { ...rootEnv, ...localEnv };

  // Make VITE_* vars available to the dev server/proxy via process.env.
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith("VITE_") && typeof value === "string") {
      process.env[key] = value;
    }
  }

  const apiTarget = env.VITE_API_URL ?? "http://127.0.0.1:8000";

  return {
    envDir: __dirname,
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 3000,
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
