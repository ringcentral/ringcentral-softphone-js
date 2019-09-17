import HtmlWebpackPlugin from 'html-webpack-plugin'
import { DefinePlugin } from 'webpack'
import dotenv from 'dotenv-override-true'

const config = {
  entry: {
    index: './demos/browser2.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'demos/index.html'
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
}

export default [config]
