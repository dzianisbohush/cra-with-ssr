const path = require('path');
const ReactLoadableSSRAddon = require('react-loadable-ssr-addon');
const ExtractCssChunks = require('extract-css-chunks-webpack-plugin');

module.exports = {
  target: 'web',
  entry: {
    index: './src/index.js',
  },
  output: {
    publicPath: '/dist/',
    filename: '[name].js', // name for file with common logic
    chunkFilename: '[name].chunk.js', // name for logic chunks
    path: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: false,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              // the plugin need for working with dynamic imports
              '@babel/plugin-syntax-dynamic-import',
              // the plugin need for working with react-loadable library
              'react-loadable/babel',
            ],
          },
        },
      },
      {
        test: /\.(gif|jpe?g|png|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.(otf|eot|svg|ttf|woff|woff2).*$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000,
            },
          },
        ],
      },
      // this say that for css handling need to use ExtractCssChunks loader by default
      {
        test: /\.css$/,
        use: [
          {
            loader: ExtractCssChunks.loader,
          },
          'css-loader',
        ],
      },
    ],
  },
  optimization: {
    nodeEnv: 'development', // NODE_ENV
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          minChunks: 2,
        },
        default: {
          minChunks: 2,
          reuseExistingChunk: true,
        },
      },
    },
  },
  plugins: [
    // the plugin need for creating chunks scheme
    new ReactLoadableSSRAddon({
      filename: 'react-loadable-ssr-addon.json',
    }),
    // the plugin need for naming css chunks
    new ExtractCssChunks({
      filename: '[name].css', // name for common styles
      chunkFilename: '[name].chunk.css', // names for styles chunks
    }),
  ],
};
