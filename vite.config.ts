
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react-swc';
  import path from 'path';

  export default defineConfig({
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Only chunk the largest dependencies that are safe to separate
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            
            if (id.includes('firebase')) {
              return 'firebase';
            }
            
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            
            // Let Vite handle the rest automatically to avoid circular deps
            return undefined;
          },
          chunkFileNames: (chunkInfo) => {
            return `assets/[name]-[hash].js`;
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      open: true,
    },
  });