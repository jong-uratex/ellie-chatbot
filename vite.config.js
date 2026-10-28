import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

// Ensure editor spawn errors never occur if an overlay error is thrown
process.env.EDITOR = 'echo';
process.env.VISUAL = 'echo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react({
        include: /\.(jsx|js)$/,
      }),
      tailwindcss()
    ],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$|public\/.*\.js$/,
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
