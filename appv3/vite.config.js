// vite.config.js
import { defineConfig } from 'vite'
import { createVuePlugin as vue } from 'vite-plugin-vue2'
import Components from 'unplugin-vue-components/vite'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
import dns from 'dns'
import path from 'path'

dns.setDefaultResultOrder('verbatim')

const API_URL = 'http://127.0.0.1:9090'

export default defineConfig({
  base: '/',               // serve assets from root
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    vue(),
    Components({ resolvers: [VuetifyResolver()] })
  ],
  server: {
    host: '0.0.0.0',       // listen on all interfaces
    port: 3000,

    // turn off HMR so you stop the auto-reload loops
    hmr: false,

    // dev performance hints
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**']
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'vuetify']
    },

    proxy: {
      // Proxy /api/* → your backend on 9090
      '^/api/': {
        target:      API_URL,
        changeOrigin: true,
        secure:      false,
        ws:          true,
        rewrite:     (p) => p.replace(/^\/api/, '')
      }
    }
  },

  // tell esbuild (used by Vite internally) to target modern JS, avoiding ES5 transform errors
  esbuild: {
    target: 'es2020'
  }
})
