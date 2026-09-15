import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env variables based on current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],

    // Path Aliases — import '@/components/...' ki jagah full path nahi likhni padegi
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@context': path.resolve(__dirname, './src/context'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
      },
    },

    // Dev Server Configuration
    server: {
      port: 5173,
      host: true,
      // API Proxy — CORS issues avoid karne ke liye backend ko proxy karo
      proxy: {
        '/api': {
          target: env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },

    // Preview Server (npm run preview)
    preview: {
      port: 4173,
      host: true,
    },

    // Build Optimization
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'icons';
            }
          },
        },
      },
      // Warn if chunk exceeds 1MB
      chunkSizeWarningLimit: 1000,
    },

    // Define global constants accessible in code
    define: {
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __APP_NAME__: JSON.stringify(env.VITE_APP_NAME || 'MaintenX OS'),
    },
  }
})
