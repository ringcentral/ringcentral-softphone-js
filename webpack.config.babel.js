import HtmlWebpackPlugin from 'html-webpack-plugin'
import { DefinePlugin } from 'webpack'
import dotenv from 'dotenv-override-true'

const config = {
  entry: {
    index: './src/browser.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new DefinePlugin({
      'process.env': JSON.stringify(dotenv.config().parsed)
    })
  ]
}

export default [config]
