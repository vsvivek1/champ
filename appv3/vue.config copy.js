module.exports = { 



  lintOnSave: false,

  devServer: { 

    port:7000,
    proxy: { 
      '^/api': { 
        target: 'http://127.0.0.1:9090:9090',
        changeOrigin: true,
        "secure": false
       } ,
     } 
   } ,




  transpileDependencies: [
    'vuetify'
  ]
,
 
 } 
