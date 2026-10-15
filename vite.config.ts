import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn, type ChildProcess } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

// Dev/preview server: listen on all interfaces, accept any Host header, and take
// the port from $PORT (or `--port`). If the port is busy Vite picks the next free one.
const port = process.env.PORT ? Number(process.env.PORT) : undefined
const PHP_PORT = Number(process.env.PHP_PORT ?? 8787)

// Runs the PHP API (public/api or dist/api) with `php -S` and proxies /api to it, so
// `npm run dev` / `npm run preview` behave like cPanel. Runtime data goes to .dev-data/
// instead of api/data/, keeping test content out of the build.
function phpApi(): Plugin {
  let php: ChildProcess | undefined
  const start = (docroot: string) => {
    const dataDir = resolve('.dev-data')
    mkdirSync(dataDir, { recursive: true })
    const htaccess = resolve(dataDir, '.htaccess')
    if (!existsSync(htaccess)) copyFileSync(resolve('public/.htaccess'), htaccess)
    php = spawn('php', ['-S', `127.0.0.1:${PHP_PORT}`, '-t', docroot], {
      env: { ...process.env, EVOCATI_DATA_DIR: dataDir, EVOCATI_HTACCESS: htaccess },
      stdio: 'ignore',
    })
    php.on('error', () => console.warn('\n  ⚠ PHP not found — the admin and contact form need `php` installed.\n'))
    process.once('exit', () => php?.kill())
  }
  return {
    name: 'php-api',
    configureServer: () => start(resolve('public')),
    configurePreviewServer: () => start(resolve('dist')),
  }
}

const proxy = { '/api': `http://127.0.0.1:${PHP_PORT}` }
const server = { host: true, port, allowedHosts: true as const, proxy }

// base: './' produces relative asset paths so the built `dist/` works when
// dropped into cPanel public_html OR any subfolder (e.g. /evocati/) without edits.
export default defineConfig({
  base: './',
  plugins: [react(), phpApi()],
  server,
  preview: server,
  // Only scan the source entry — not the old built copy in www/.
  optimizeDeps: { entries: ['index.html'] },
})
