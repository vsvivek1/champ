const {  defineConfig  }  = require('@vue/cli-service' )


module.exports = defineConfig({ 


  configureWebpack: { 
resolve:{ 


  fallback:{ 
"http":require.resolve('stream-http' ),
"crypto":require.resolve('crypto-browserify' ),
"https":require.resolve('https-browserify' ),

"zlib":require.resolve('browserify-zlib' ),
"stream":require.resolve('stream-browserify' ),
"zlib": require.resolve("browserify-zlib" )
    
   } 
 } ,

    plugins: [
     
    ] } ,
  transpileDependencies: [
    'vuetify'
  ],
  lintOnSave: false,
  devServer: { 

    port:7000,
    proxy: { 
      '^/api': { 
        target: 'http://127.0.0.1:9090',
        changeOrigin: true,
        "secure": false,
        ws:true,

        configure: (proxy, _options ) => { 
          proxy.on('error', (err, _req, _res ) => { 
            console.log('proxy error', err );
           }  );
          proxy.on('proxyReq', (proxyReq, req, _res ) => { 
            console.log('Sending Request to the Target:', req.method, req.url );
           }  );
          proxy.on('proxyRes', (proxyRes, req, _res ) => { 
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url );
           }  );
       } ,
     } 
   } ,
 }  )
