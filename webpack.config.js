const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
var path = require('path');
var webpack = require('webpack');

const sassLoaders = [
  'css-loader',
  'sass-loader?indentedSyntax=sass&includePaths[]=' + path.resolve(__dirname, './src')
]

var DEVELOPMENT = process.env.NODE_ENV === 'development';
var PRODUCTION = process.env.NODE_ENV === 'production';

var PATH = {
    WWW: path.resolve(__dirname, "dist"),
    BUILD: path.resolve(__dirname, "build")
};

var entry = PRODUCTION 
            ? ['./src/js/main']
            : [
                'webpack-dev-server/client?http://localhost:8080',
                //'webpack/hot/dev-server',
                './src/js/main'
             ];

module.exports = {
  entry: ['./src/js/main'], //entry,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: 'bundle.js',
  },
  devServer: {
    inline: true,
    historyApiFallback: true,
    contentBase: './',
    hot: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      {
        test: /\.scss$/,
            use: [{
                loader: "style-loader" // creates style nodes from JS strings
            }, {
                loader: "css-loader" // translates CSS into CommonJS
            }, {
                loader: "sass-loader", // compiles Sass to CSS
                options : {
                includePaths: [
                    path.resolve('node_modules')
                ]}
            }]
      },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        test: /\.(jpe?g|woff2?|ttf|eot|svg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },
      {
        test: /\.ico$/,
        loader: "url-loader",
        query: { mimetype: "image/x-icon" }
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
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(require("./package.json").version)
    })  ],
  resolve: {
    extensions: ['.js', '.sass'],
    // root: [path.join(__dirname, './src')]
    modules: [
     path.join(__dirname, "src"),
     "node_modules"
   ]
  }
};

