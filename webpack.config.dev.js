const path = require('path');
const exec = require('child_process').exec;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WebpackNotifierPlugin = require('webpack-notifier');
const pkgJson = require('./package');
const buildDate = new Date();
function CopyDirPlugin(source, destination) {
  this.source = source;
  this.destination = destination;
}

CopyDirPlugin.prototype.apply = function(compiler) {
  compiler.plugin('done', () => {
    console.log(compiler.outputPath, this.destination);
    exec('cp -r ' + this.source + ' ' + path.join(compiler.outputPath, this.destination));
  });
};

module.exports = {
  devtool: 'source-map',
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' }
  },
  entry: {
    app: ['webpack-dev-server/client?http://0.0.0.0:3300', 'webpack/hot/only-dev-server', path.join(__dirname, 'src/app/index.js')],
    lib: ['d3', 'react', 'react-dom', 'classnames', 'fbemitter', 'lz-string']
  },
  resolve: {
    // When requiring, you don't need to add these extensions
    extensions: ['.js', '.jsx', '.json', '.less']
  },
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'app.js',
    publicPath: '/'
  },
  plugins: [
    new CopyDirPlugin(path.join(__dirname, 'src/.htaccess'), ''),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'lib',
      filename: 'lib.js'
    }),
    new HtmlWebpackPlugin({
      inject: false,
      template: path.join(__dirname, 'src/index.ejs'),
      version: pkgJson.version,
      date: buildDate,
      gapiKey: process.env.CORIOLIS_GAPI_KEY || ''
    }),
    new ExtractTextPlugin({
      filename: 'app.css',
      disable: false,
      allChunks: true
    }),
    new WebpackNotifierPlugin({ alwaysNotify: true }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  module: {
    rules: [
      { test: /\.css$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }) },
      { test: /\.less$/, loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader!less-loader' }) },
      { test: /\.(js|jsx)$/, loaders: ['babel-loader'], include: path.join(__dirname, 'src') },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file-loader' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url-loader?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
