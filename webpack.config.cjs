const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './src/js/player.js',
    styles: './src/styles/main.scss'
  },
  output: {
    filename: 'js/[name].bundle.js',
    path: path.resolve(__dirname, 'public'),
    clean: false
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'src/images',
          to: 'images',
          noErrorOnMissing: true
        },
        {
          from: 'src/mp3',
          to: 'mp3',
          noErrorOnMissing: true
        },
        {
          from: 'src/webm',
          to: 'webm',
          noErrorOnMissing: true
        },
        {
          from: 'src/aac',
          to: 'aac',
          noErrorOnMissing: true
        },
        {
          from: 'src/js',
          to: 'js',
          noErrorOnMissing: true,
          globOptions: {
            ignore: ['**/player.js'] // Exclude player.js since it's handled by webpack entry
          }
        },
        {
          from: 'src/webfonts',
          to: 'webfonts',
          noErrorOnMissing: true
        }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 3001,
    hot: true
  },
  performance: {
    hints: false,
    maxAssetSize: 100000000,
    maxEntrypointSize: 100000000
  },
  mode: 'development'
};