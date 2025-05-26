import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compressionPlugin from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    compressionPlugin({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Apenas arquivos maiores que 10kb
      deleteOriginFile: false,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    include: ['buffer'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  build: {
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['tailwind-merge', 'clsx', 'class-variance-authority'],
          web3: ['wagmi', 'viem'],
        }
      }
    },
    // Otimizações adicionais para produção
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
  // Aumentando limite de memória para melhorar a performance de build
  define: {
    'process.env.VITE_MEMORY_LIMIT': JSON.stringify('4096'),
  },
})
