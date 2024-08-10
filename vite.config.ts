import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";
import { htmlInjectionPlugin } from "vite-plugin-html-injection";

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 3001,
    },
    build: {
        outDir: "build",
    },
    plugins: [
        react(),
        VitePWA({
            registerType: "prompt",
            injectRegister: "script",
            pwaAssets: {
                disabled: false,
                config: true,
            },
            manifest: {
                short_name: "Food Software",
                name: "Brenna's Food Software",
                icons: [
                    {
                        src: "android-chrome-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-384x384.png",
                        sizes: "384x384",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "android-chrome-96x96.png",
                        sizes: "96x96",
                        type: "image/png",
                    },
                ],
                scope: "/",
                start_url: "/shop",
                display: "standalone",
                theme_color: "#F57F17",
                background_color: "#ffffff",
                shortcuts: [
                    {
                        name: "Shop",
                        url: "/shop",
                        icons: [
                            {
                                src: "shop-96x96.png",
                                sizes: "96x96",
                            },
                            {
                                src: "shop-192x192.png",
                                sizes: "192x192",
                            },
                        ],
                    },
                    {
                        name: "Plan",
                        url: "/plan",
                        icons: [
                            {
                                src: "plan-96x96.png",
                                sizes: "96x96",
                            },
                            {
                                src: "plan-192x192.png",
                                sizes: "192x192",
                            },
                        ],
                    },
                    {
                        short_name: "Recipes",
                        name: "Recipe Library",
                        url: "/library",
                        icons: [
                            {
                                src: "library-96x96.png",
                                sizes: "96x96",
                            },
                            {
                                src: "library-192x192.png",
                                sizes: "192x192",
                            },
                        ],
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
                cleanupOutdatedCaches: true,
                clientsClaim: true,
            },
            devOptions: {
                enabled: true,
                navigateFallback: "index.html",
                suppressWarnings: false,
                type: "module",
            },
        }),
        htmlInjectionPlugin({
            injections: [
                {
                    name: "meta prod",
                    path: "./src/snippets/meta.html",
                    type: "raw",
                    injectTo: "head",
                    buildModes: "prod",
                },
                {
                    name: "meta dev",
                    path: "./src/snippets/meta_dev.html",
                    type: "raw",
                    injectTo: "head",
                    buildModes: "dev",
                },
            ],
        }),
    ],
    test: {
        globals: true,
        environment: "jsdom",
        css: true,
        reporters: ["verbose"],
        coverage: {
            reporter: ["text", "json", "html"],
            include: ["src/**/*"],
            exclude: [],
        },
    },
});
