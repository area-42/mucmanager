module.exports = {
  publicPath: '',
  configureWebpack:{
    optimization: {
      splitChunks: {
        minSize: 10000,
        maxSize: 200000
      }
    }
  }
}
