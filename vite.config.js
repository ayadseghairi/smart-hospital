import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      // Service worker filename
      filename: "sw.js",
      // Precache only static app shell
      includeAssets: ["logo.jpg", "icons/*.png", "icons/*.svg"],
      // Manifest is in public/ — don't generate one
      manifest: false,
      workbox: {
        // Precache the compiled app shell
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // NEVER cache API or auth routes — privacy-critical health platform
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sw\.js/,
          /^\/manifest\.webmanifest/,
          /^\/icons\//,
          /^\/assets\//,
          /^\/\.well-known\//,
        ],
        runtimeCaching: [
          // Emergency numbers: stale-while-revalidate for offline availability
          {
            urlPattern: /\/api\/v1\/emergency\/numbers/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "emergency-numbers",
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          // All other API routes: NetworkOnly (no caching of personal/medical data)
          {
            urlPattern: /\/api\//,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: {
        enabled: false, // Don't run SW in dev to avoid stale cache issues
      },
    }),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Chunk size warnings at 500KB
    chunkSizeWarningLimit: 500,
  },
})
