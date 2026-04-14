import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // ── Pre-bundle des dépendances CJS ────────────────────────────────────────
  optimizeDeps: {
    include: ['laravel-echo', 'pusher-js'],
  },

  // ── Build de production ────────────────────────────────────────────────────
  build: {
    target: 'es2020',
    // Supprimer console.* et debugger du bundle de production
    minify: 'esbuild',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Sépare les vendors en chunks stables (meilleur cache navigateur)
        manualChunks: {
          'vendor-vue':    ['vue', 'vue-router', 'pinia'],
          'vendor-ui':     ['vue-sonner'],
          'vendor-echo':   ['laravel-echo', 'pusher-js'],
          'vendor-utils':  ['axios', '@vueuse/core'],
        },
      },
    },
  },

  // ── Strip console/debugger en prod uniquement ─────────────────────────────
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  // ── Tests ─────────────────────────────────────────────────────────────────
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,vue}'],
      exclude: ['src/tests/**', 'src/main.js'],
    },
  },
})