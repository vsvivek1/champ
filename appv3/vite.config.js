import { defineConfig } from 'vite'

import { createVuePlugin as vue } from "vite-plugin-vue2";

import Components from 'unplugin-vue-components/vite';
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';

import fs from 'fs'

import dns from 'dns'

dns.setDefaultResultOrder('verbatim')

//  import vuetify from './src/plugins/vuetify';

var tUrl="http://127.0.0.1:9090"

import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),

    Components({
      resolvers: [
        // Vuetify
        VuetifyResolver(),
      ],
    })

   
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
https: {
      key: fs.readFileSync('./think-vivek-thinkpad-e14-gen-5.taild05309.ts.net.key'),
      cert: fs.readFileSync('./think-vivek-thinkpad-e14-gen-5.taild05309.ts.net.crt'),
    },


  proxy: {
    '^/api/': {
      target: tUrl,
      changeOrigin: true,
      secure: true,
      ws: true,
      
      // rewrite: (path) => path.replace(/^\/api/, ''),


      // configure: (proxy, _options) => {
      //   proxy.on('error', (err, _req, _res) => {
      //     console.log('proxy error', err);
      //   });
      //   proxy.on('proxyReq', (proxyReq, req, _res) => {
      //     console.log('Sending Request to the Target:', req.method, req.url);
      //   });
      //   proxy.on('proxyRes', (proxyRes, req, _res) => {
      //     console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
      //   });

      // },
      
     
    },
  }
}
})

// vuetify({ autoImport: true })
// rewrite: (path) => path.replace(/^\/api/, ""),
// rewrite: (path) => path.replace(/^\/api/, '')