import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import { htmlInjectionPlugin } from "vite-plugin-html-injection";
import { VitePWA } from "vite-plugin-pwa";

const ENV_DIR = "env";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Vite doesn't load .env until after config is resolved, so it knows where
    // to look. But us humans already know, so load 'er up!
    const env = loadEnv(mode, `${process.cwd()}/${ENV_DIR}`, "VITE_");
    return {
        define: {
            "import.meta.env.BUILD_TIMESTAMP": JSON.stringify(
                new Date().toISOString(),
            ),
            // apollo client's "dev mode"
            "globalThis.__DEV__": JSON.stringify(mode === "development"),
        },
        envDir: ENV_DIR,
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
            // When switching from CRA to Vite, the main bundle was ~550 kb, for
            // both systems. Setting this slightly larger to hopefully catch any
            // egregious future growth, but not warn about the status quo.
            chunkSizeWarningLimit: 600,
        },
        plugins: [
            react({
                // This SWC plugin can nominally avoid the silliness in codegen
                // output, where there are two non-tree-shakeable copies of each
                // query in the prod bundle. But per SOP, there is no version
                // compatibility matrix, and whatever we have doesn't work. Docs
                // are: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#swc-plugin
                // The package name: @graphql-codegen/client-preset-swc-plugin
                // plugins: [
                //     [
                //         "@graphql-codegen/client-preset-swc-plugin",
                //         {
                //             artifactDirectory: "./src/__generated__/",
                //             gqlTagName: "gql",
                //         },
                //     ],
                // ],
            }),
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
                            purpose: "any",
                        },
                        {
                            src: "android-chrome-512x512.png",
                            sizes: "512x512",
                            type: "image/png",
                            purpose: "maskable",
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
                    // equivalent to import.meta.env.VITE_THEME_COLOR
                    theme_color: env.VITE_THEME_COLOR,
                    background_color: "#1b1b1b",
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
    };
});
