const path = require('path');

const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const LinkTypePlugin = require('html-webpack-link-type-plugin').HtmlWebpackLinkTypePlugin;
const Dotenv = require('dotenv-webpack');

const publicFolder = path.join(__dirname, 'public');

module.exports = (env) => {
  const { TARGET_ENV } = env;

  const mode = TARGET_ENV === 'production' ? 'production' : 'development';

  return {
    mode,

    // webpack will take the files from ./src/index
    entry: ['babel-polyfill', './src/index.js'],
    resolve: {
      extensions: ['.js'],
    },

    output: {
      path: path.join(__dirname, '/dist'),
      filename: './[name].[hash].js',
    },

    module: {
      rules: [
        // we use babel-loader to load our JS files
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },

        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader',
            },
          ],
        },

        {
          test: /\.scss$/,
          use: [
            // fallback to style-loader in development to get HMR
            // production uses extracted .css file for better browser caching
            process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: process.env.NODE_ENV !== 'production',
                importLoaders: 1, //means that it also applies CSS modules on @imported resources.
                modules: {
                  localIdentName:
                    process.env.NODE_ENV !== 'production' ? '[local]__[hash:base64:5]' : '[hash:base64:5]',
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: process.env.NODE_ENV !== 'production',
              },
            },
            {
              loader: 'sass-resources-loader',
              options: {
                resources: ['./src/style/base/_variables.scss'],
              },
            },
          ],
          include: /\.module\.scss$/,
        },

        {
          test: /\.scss$/,
          use: [
            // fallback to style-loader in development to get HMR
            // production uses extracted .css file for better browser caching
            process.env.NODE_ENV === 'production' ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                sourceMap: process.env.NODE_ENV !== 'production',
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: process.env.NODE_ENV !== 'production',
              },
            },
            {
              loader: 'sass-resources-loader',
              options: {
                resources: ['./src/style/base/_variables.scss'],
              },
            },
          ],
          exclude: /\.module\.scss$/,
        },
      ],
    },

    devServer: {
      host: '0.0.0.0',
      contentBase: publicFolder,
      historyApiFallback: true,
      hot: TARGET_ENV !== 'production',
      inline: true,
      port: 3000,
    },

    plugins: [
      new HtmlWebPackPlugin({
        template: path.join(__dirname, 'public/index.html'),
        filename: './index.html',
      }),
      // including all sub-pages in their own folder to have nice url paths (e.g. /sub-page instead of /sub-page.html)
      new HtmlWebPackPlugin({
        template: path.join(__dirname, 'public/sub-page/index.html'),
        filename: './sub-page/index.html',
      }),
      //
      new CopyPlugin({
        patterns: [{ from: publicFolder }],
      }),
      new MiniCssExtractPlugin({
        filename: './[name].css',
      }),
      new LinkTypePlugin({
        '*.css': 'text/css',
      }),
      new Dotenv({
        path: `./.env.${TARGET_ENV}`,
      }),
    ],
  };
};
