import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    // PRODUCTION FIX: Removed allowedHosts: true (security risk)
    // For local dev, Vite defaults are secure. For production, use proper reverse proxy.
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 