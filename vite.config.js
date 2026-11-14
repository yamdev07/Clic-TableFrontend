import process from 'node:process'
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

  // ── Accessible depuis les autres appareils du réseau local (tablettes, téléphones)
  server: { host: true, port: 5173 },
  preview: { host: true, port: 5173 },

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
        // (Rolldown / Vite 8 n'accepte qu'une fonction pour manualChunks)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](vue|@vue|vue-router|pinia)[\\/]/.test(id)) return 'vendor-vue'
          if (/[\\/]node_modules[\\/]vue-sonner[\\/]/.test(id)) return 'vendor-ui'
          if (/[\\/]node_modules[\\/](laravel-echo|pusher-js)[\\/]/.test(id)) return 'vendor-echo'
          if (/[\\/]node_modules[\\/](axios|@vueuse)[\\/]/.test(id)) return 'vendor-utils'
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