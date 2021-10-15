const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'pega-offline-diagnostic-tool.js',
    library: 'PegaOfflineDiagnosticTool'
  },
  plugins: [new ESLintPlugin({})],
  mode: 'development',
  devtool: 'inline-source-map'
};