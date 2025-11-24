import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const target = 'https://app.duix.ai';

export default defineConfig(({ mode }): any => {
  if (mode === 'development') {
    return {
      plugins: [react(), tailwindcss(), basicSsl()],
      server: {
        https: true,
        port: 5173,
        host: '0.0.0.0',
        hmr: {
          clientPort: '443'
        },
        proxy: {
          '/avatar-duix': {
            target,
            changeOrigin: true,
            secure: false
          },
          '/avatar2c': {
            target,
            changeOrigin: true,
            secure: false
          },
          '/duix-oversea': {
            target,
            changeOrigin: true
          },
          '/duix': {
            target,
            changeOrigin: true
          },
          '/kb-sys-api': {
            target,
            changeOrigin: true
          },
          '/duix-openapi-v2': {
            target,
            changeOrigin: true
          },
          '/live-cloud-manage': {
            target,
            changeOrigin: true
          },
          '/duix-chatserver': {
            target,
            changeOrigin: true
          },
          '/socket.io': {
            target: 'ws://localhost:5174',
            ws: true,
            rewriteWsOrigin: true
          }
        }
      }
    };
  }
  return {
    plugins: [react(), tailwindcss(), dts({ tsconfigPath: 'tsconfig.app.json' })],
    build: {
      outDir: 'dist',
      lib: {
        entry: './package/index.tsx',
        name: 'ChatBox',
        fileName: 'index'
      },
      sourcemap: true,
      rollupOptions: {
        external: ['react', 'zustand', 'react-dom', 'react-jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            zustand: 'Zustand',
            'react-dom': 'ReactDOM',
            'react-jsx-runtime': 'ReactJSXRuntime',
            tailwindcss: 'TailwindCSS'
          },
          exports: 'named'
        }
      }
    }
  };
});
