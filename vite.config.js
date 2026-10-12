import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.svg"],
            manifest: {
                name: "Arte e Fios Barbearia",
                short_name: "Arte e Fios",
                description: "Gestão e fidelização local",
                theme_color: "#2C1E16",
                background_color: "#2C1E16",
                display: "standalone",
                orientation: "portrait",
                lang: "pt-BR",
                icons: [
                    {
                        src: "/favicon.svg",
                        sizes: "any",
                        type: "image/svg+xml",
                        purpose: "any maskable"
                    }
                ]
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,woff2}"],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024
            }
        })
    ]
});
