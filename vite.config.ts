import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev/preview server: listen on all interfaces, accept any Host header, and take
// the port from $PORT (or `--port`). If the port is busy Vite picks the next free one.
const port = process.env.PORT ? Number(process.env.PORT) : undefined
const server = { host: true, port, allowedHosts: true as const }

// base: './' produces relative asset paths, so dist/ also works from a subfolder.
export default defineConfig({
  base: './',
  plugins: [react()],
  server,
  preview: server,
  // Only scan the source entry, not the old built copy in www/.
  optimizeDeps: { entries: ['index.html'] },
})
