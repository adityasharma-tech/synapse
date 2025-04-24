import path from "path"
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, "../../"),
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      "synapse-local.adityasharma.live",
      "synapse.adityasharma.live",
      "localport-3000.adityasharma.live",
    ],
  },
  base: "/",
  resolve: {
    alias: {
      "zod-client": path.resolve(__dirname, "../../packages/zod-client")
    }
  },
});
