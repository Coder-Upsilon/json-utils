const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './src/main.ts',
      jsonfilter: './src/jsonfilter.ts',
      formatconvert: './src/formatconvert.ts',
      about: './src/about.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      chunkFilename: isProduction ? '[name].[contenthash].chunk.js' : '[name].chunk.js',
      clean: true,
      crossOriginLoading: 'anonymous',
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader',
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        chunks: ['main', 'codemirror', 'jsonrepair', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/jsonfilter.html',
        filename: 'jsonfilter.html',
        chunks: ['jsonfilter', 'codemirror', 'jsonpath', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/formatconvert.html',
        filename: 'formatconvert.html',
        chunks: ['formatconvert', 'codemirror', 'jsonrepair', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/about.html',
        filename: 'about.html',
        chunks: ['about', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      // Chinese pages
      new HtmlWebpackPlugin({
        template: './src/cn/index.html',
        filename: 'cn/index.html',
        chunks: ['main', 'codemirror', 'jsonrepair', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/cn/jsonfilter.html',
        filename: 'cn/jsonfilter.html',
        chunks: ['jsonfilter', 'codemirror', 'jsonpath', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/cn/formatconvert.html',
        filename: 'cn/formatconvert.html',
        chunks: ['formatconvert', 'codemirror', 'jsonrepair', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new HtmlWebpackPlugin({
        template: './src/cn/about.html',
        filename: 'cn/about.html',
        chunks: ['about', 'vendors'],
        inject: true,
        scriptLoading: 'defer',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/css',
            to: 'css',
          },
          {
            from: 'src/assets',
            to: 'assets',
          },
          {
            from: 'src/robots.txt',
            to: 'robots.txt',
          },
          {
            from: 'src/sitemap.xml',
            to: 'sitemap.xml',
          },
          {
            from: 'CNAME',
            to: '.',
            toType: 'dir',
          },
        ],
      }),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        })
      ] : []),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
    },
    optimization: {
      usedExports: true,
      sideEffects: false,
      moduleIds: 'deterministic',
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          codemirror: {
            test: /[\\/]node_modules[\\/]codemirror[\\/]/,
            name: 'codemirror',
            chunks: 'all',
            priority: 20,
            reuseExistingChunk: true,
          },
          jsonpath: {
            test: /[\\/]node_modules[\\/]jsonpath[\\/]/,
            name: 'jsonpath',
            chunks: 'all',
            priority: 15,
            reuseExistingChunk: true,
          },
          jsonrepair: {
            test: /[\\/]node_modules[\\/]jsonrepair[\\/]/,
            name: 'jsonrepair',
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      ...(isProduction && {
        minimize: true,
        concatenateModules: true,
        providedExports: true,
        innerGraph: true,
      }),
    },
  };
};
