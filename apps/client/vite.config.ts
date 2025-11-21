import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export const envPath = path.resolve(process.cwd(), "..", "..");

export default defineConfig(({ mode }) => {
  const {
    APP_URL,
    FILE_UPLOAD_SIZE_LIMIT,
    FILE_IMPORT_SIZE_LIMIT,
    DRAWIO_URL,
    CLOUD,
    SUBDOMAIN_HOST,
    COLLAB_URL,
    BILLING_TRIAL_DAYS,
    POSTHOG_HOST,
    POSTHOG_KEY,
  } = loadEnv(mode, envPath, "");

  return {
    define: {
      "process.env": {
        APP_URL,
        FILE_UPLOAD_SIZE_LIMIT,
        FILE_IMPORT_SIZE_LIMIT,
        DRAWIO_URL,
        CLOUD,
        SUBDOMAIN_HOST,
        COLLAB_URL,
        BILLING_TRIAL_DAYS,
        POSTHOG_HOST,
        POSTHOG_KEY,
      },
      APP_VERSION: JSON.stringify(process.env.npm_package_version),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mantine-vendor': [
              '@mantine/core',
              '@mantine/hooks',
              '@mantine/form',
              '@mantine/modals',
              '@mantine/notifications',
              '@mantine/spotlight',
              '@mantine/dates',
            ],
            'editor-core': [
              '@tiptap/react',
              '@tiptap/core',
              '@tiptap/pm',
              '@tiptap/extension-character-count',
            ],
            'collab': ['yjs', 'y-indexeddb', '@hocuspocus/provider'],
            'excalidraw': ['@excalidraw/excalidraw'],
            'mermaid': ['mermaid'],
            'drawio': ['react-drawio'],
            'heavy-deps': ['katex', 'lowlight', 'emoji-mart', '@emoji-mart/react', '@emoji-mart/data'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      hmr: {
        overlay: true,
      },
      proxy: {
        "/api": {
          target: APP_URL,
          changeOrigin: false,
        },
        "/socket.io": {
          target: APP_URL,
          ws: true,
          rewriteWsOrigin: true,
        },
        "/collab": {
          target: APP_URL,
          ws: true,
          rewriteWsOrigin: true,
        },
      },
    },
  };
});
