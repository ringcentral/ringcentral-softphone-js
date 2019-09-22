import HtmlWebpackPlugin from 'html-webpack-plugin'
import { HotModuleReplacementPlugin, DefinePlugin } from 'webpack'
import dotenv from 'dotenv-override-true'

const config = {
  entry: {
    index: './demos/browser/index.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'demos/browser/index.html'
    }),
    new HotModuleReplacementPlugin(),
    new DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
}

export default [config]
