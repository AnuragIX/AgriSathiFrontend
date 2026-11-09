// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  vite: {
    plugins: [
      VitePWA({
        strategies: "generateSW",
        filename: "sw.js",
        injectRegister: null,
        registerType: "autoUpdate",
        devOptions: { enabled: false },
        manifest: {
          name: "AgriSathi — Your Assam Farm Companion",
          short_name: "AgriSathi",
          start_url: "/",
          display: "standalone",
          theme_color: "#f5faf5",
          background_color: "#f5faf5",
          icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
        },
        workbox: {
          navigateFallbackDenylist: [/^\/~oauth/],
          runtimeCaching: [
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: { cacheName: "agrisathi-pages", networkTimeoutSeconds: 3 },
            },
            {
              urlPattern: ({ url }) =>
                url.origin === self.location.origin &&
                /\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.(?:js|css|png|jpe?g|webp|svg)$/.test(
                  url.pathname,
                ),
              handler: "CacheFirst",
              options: {
                cacheName: "agrisathi-assets",
                expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 },
              },
            },
          ],
        },
      }),
    ],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
