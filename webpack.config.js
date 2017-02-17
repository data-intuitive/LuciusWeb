const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
var path = require('path');
var webpack = require('webpack');

const sassLoaders = [
  'css-loader',
  'sass-loader?indentedSyntax=sass&includePaths[]=' + path.resolve(__dirname, './src')
]

var ENV = process.env.NODE_ENV;

var PATH = {
    WWW: path.resolve(__dirname, "dist"),
    BUILD: path.resolve(__dirname, "build")
};

module.exports = {
  //   entry: ( ENV == 'production' ?
  //          ['./src/js/main']
  //          :
  //          [
  //           'webpack-dev-server/client?http://localhost:8080',
  //           'webpack/hot/dev-server',
  //           './src/js/main'
  //          ]
  // ),
  entry: {
    // bundle: [ path.resolve('src/js', "main") ],
    bundle: './src/js/main'
    // vendors: ["webpack-material-design-icons"]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel-loader']
      },
      // {
      //   test: /\.css$/,
      //   loader: ExtractTextPlugin.extract({ fallback: 'style-loader', loader: ['css-loader']})
      // },
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { 
        test: /\.(jpe?g|woff2?|ttf|eot|svg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        loader: "file-loader?name=fonts/[name].[ext]"
      },
      // {
      //     test: /\.(eot|svg|ttf|woff|woff2)$/,
      //     loader: 'file-loader?name=material-design-icons/iconfont/[name].[ext]'
      // }
    ]
  },
  output: {
    filename: 'dist/bundle.js',
    // path: path.resolve(__dirname, 'dist'),
    // path: path.resolve(__dirname, "dist"),
    // filename: "[name].js",
    // chunkFilename: "[name].js"
  },
  plugins: [
    // new webpack.optimize.CommonsChunkPlugin({
    //         names: ["vendors"]
    //     }),
    new ExtractTextPlugin('[name].css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery',
      "Hammer": "hammerjs/hammer"
    })
  ],
  resolve: {
    extensions: ['.js', '.sass'],
    // root: [path.join(__dirname, './src')]
    modules: [
     path.join(__dirname, "src"),
     "node_modules"
   ]
  }
};


// module.exports = {
//   entry: ( ENV == 'production' ?
//            ['./js/main']
//            :
//            [
//             'webpack-dev-server/client?http://localhost:8080',
//             'webpack/hot/dev-server',
//             './js/main'
//            ]
//   ),
//   output: {
//     filename: './dist/bundle.js'
//   },
//   module: {
//     loaders: [
//       {
//         test: /\.js$/,
//         loaders: ['babel-loader'],
// 	      include: path.join(__dirname, 'src'),
//         // include: __dirname,
//         exclude: /node_modules/
//       }
//     ]
//   },
//   plugins: ( ENV == 'production' ?
//              [
//               new webpack.optimize.UglifyJsPlugin({minimize: true}),
//              ]
//              :
//              [new webpack.HotModuleReplacementPlugin()]
//   ),
//   devServer: {
//     historyApiFallback: true,
//     contentBase: './',
//     hot: true
//   }
// };
