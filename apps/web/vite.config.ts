import { defineConfig } from "vite";
import path from "path"
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
console.log(__dirname)
// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(__dirname, "../../.env"),
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
      "zod-client": "../../../../packages/zod-client"
    }
  },
});
