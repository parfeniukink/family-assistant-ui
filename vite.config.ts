import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    resolve: {
      alias: {
        src: path.resolve(__dirname, "src"),
      },
    },
    preview: {
      allowedHosts: [env.VITE_ALLOWED_HOST],
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
    build: {
      target: "es2022",
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router-dom"],
            "vendor-toast": ["react-hot-toast"],
          },
        },
      },
      cssCodeSplit: true,
      chunkSizeWarningLimit: 500,
    },
  };
});
