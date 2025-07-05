import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    envDir: path.resolve(__dirname, "../../"),
    plugins: [react(), tailwindcss()],
    server: {
        allowedHosts: [
            "s.uignite.in",
            "localport-3000.adityasharma.live",
            "rambhardwaj.in",
            "auth.adityasharma.tech",
            "synapse.adityasharma.tech",
        ],
    },
    base: "/",
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@pkgs": path.resolve(__dirname, "../../packages"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    lodash: ["lodash"],
                    axios: ["axios"],
                },
            },
        },
    },
});
