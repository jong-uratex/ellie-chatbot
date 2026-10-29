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

import fs from 'fs';

function cloudflarePagesStaticPlugin() {
  return {
    name: 'cloudflare-pages-static-sync',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const distPublic = path.resolve(distDir, 'public');
      try {
        if (!fs.existsSync(distPublic)) {
          fs.mkdirSync(distPublic, { recursive: true });
        }
        const publicFiles = ['ding-widget.js', 'ding-widget.css', 'ellie.jpeg'];
        for (const f of publicFiles) {
          const src = path.resolve(__dirname, 'public', f);
          const dest = path.resolve(distPublic, f);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
          }
        }
      } catch (e) {
        console.warn('Post-bundle public sync warning:', e);
      }
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [
      react({
        include: /\.(jsx|js)$/,
      }),
      tailwindcss(),
      cloudflarePagesStaticPlugin()
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
