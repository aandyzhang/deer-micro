module.exports = {
    devServer: {
      port: 8888,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    publicPath: "http://localhost:8888",
    configureWebpack: {
      output: {
        library: `vue`,
        libraryTarget: 'umd',
      },
    },
  }
  