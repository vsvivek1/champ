// vite.config.mjs
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import fs from 'fs'
import path from 'path'
import dns from 'dns'
import { fileURLToPath } from 'url'

// Workaround for __dirname in ESM
var __filename = fileURLToPath(import.meta.url) // use var to avoid es5 transform issues
var __dirname = path.dirname(__filename) // use var

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  plugins: [
    createVuePlugin(),
    Components({ resolvers: [VuetifyResolver()] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Uncomment if needed
    // https: {
    //   key: fs.readFileSync(path.resolve(__dirname, 'your.key')),
    //   cert: fs.readFileSync(path.resolve(__dirname, 'your.crt'))
    // },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9090',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (p) => p.replace(/^\/api/, '')
      }
    }
  },
  esbuild: {
    target: 'es2020'
  }
})
