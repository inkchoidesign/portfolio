import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/* Vite always tags the entry script as type="module" crossorigin, which
   browsers refuse to load over file://. The bundle is already iife, so
   strip both attributes after the HTML is generated. `defer` replaces the
   deferred execution that type="module" gave us, so the bundle still runs
   after #root exists. */
const plainScriptTag = () => ({
  name: 'plain-script-tag',
  enforce: 'post',
  transformIndexHtml: (html) =>
    html.replace(/<script type="module" crossorigin src=/g, '<script defer src='),
})

export default defineConfig({
  plugins: [react(), plainScriptTag()],
  /* './' so the built dist/index.html can be opened directly from the
     file system (double-click) instead of needing a server. */
  base: './',
  build: {
    rollupOptions: {
      output: {
        /* iife instead of ES modules: browsers block type="module"
           scripts over file:// due to CORS. */
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
})
