import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// /api va al backend; en Docker lo hace nginx
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_API ?? 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // separar React de MUI rompe el orden de carga
        // jsqr queda aparte: solo se descarga al abrir la cámara en un navegador sin BarcodeDetector
        // pdfjs-dist también: solo se descarga al revisar un PDF en control de calidad
        manualChunks: (id) =>
          id.includes('node_modules') && !id.includes('/jsqr/') && !id.includes('/pdfjs-dist/')
            ? 'vendor'
            : undefined,
      },
    },
  },
});
