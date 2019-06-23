const { resolve } = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  context: __dirname,
  entry: {
    main: "./src/main.tsx"
  },
  output: {
    path: resolve(__dirname, "public"),
    // publicPath: "public/",
    filename: "[name].js"
  },
  mode: "production",
  optimization: {
    splitChunks: {
      chunks: "all"
    },
    runtimeChunk: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src", "index.html"),
      filename: resolve(__dirname, "index.html")
    }),
    new webpack.DefinePlugin({
      __NODE_ENV__: JSON.stringify("production")
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: resolve(__dirname, "src"),
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          "style-loader",
          "css-modules-typescript-loader",
          {
            loader: "css-loader",
            options: {
              modules: true
            }
          },
          "sass-loader"
        ]
      }
    ]
  },
  // devtool: "source-map",
  resolve: {
    alias: {
      src: resolve(__dirname, "src")
    },
    extensions: [".ts", ".tsx", ".js", ".json", ".scss"]
  }
};
