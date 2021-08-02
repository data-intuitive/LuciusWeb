const ExtractTextPlugin = require('mini-css-extract-plugin')
var path = require('path');
var webpack = require('webpack');

module.exports = {
  watch: false,
  entry: ['./src/js/main'],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js',
  },
  devServer: {
    inline: true,
    historyApiFallback: true,
    contentBase: './',
    hot: false,
    port: 3000
  },
  // externals: {
  //   deployments: './deployments.json'
  // },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", 
          { loader: "sass-loader",
            options: {
              sassOptions: {includePaths: ["node_modules"]}
            }
          }
        ]
      },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(jpe?g|woff2?|ttf|eot|svg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/'
            }
          }
        ]
      },
      {
          test: /\.ico$/,
          use: [ "url-loader" ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    })  ],
  resolve: {
    extensions: ['.js', '.sass'],
    modules: [
     path.join(__dirname, "src"),
     "node_modules"
   ]
  }
};
