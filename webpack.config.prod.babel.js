import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'

const config = {
  mode: 'production',
  devtool: 'source-map',
  entry: {
    index: './src/index.js'
  },
  output: {
    library: 'Softphone',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this' // fix window undefined issue in node
  },
  plugins: [
    new BundleAnalyzerPlugin()
  ]
}

export default [config]
