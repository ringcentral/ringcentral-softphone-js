import nodeExternals from 'webpack-node-externals'

const config = {
  mode: 'production',
  devtool: 'source-map',
  target: 'node',
  entry: {
    index: './src/index.js'
  },
  output: {
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals()]
}

export default [config]
