module.exports = {
  lintOnSave: false,

  devServer: {

    port:7000,
    proxy: {
      '^/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
        "secure": false
      },
    }
  },

  transpileDependencies: [
    'vuetify'
  ]
}
