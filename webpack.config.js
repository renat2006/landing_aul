const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    entry: {
      main: './src/script.js'
    },
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash:8].js' : 'js/[name].js',
      chunkFilename: isProduction ? 'js/[name].[contenthash:8].chunk.js' : 'js/[name].chunk.js',
      assetModuleFilename: isProduction ? 'assets/[name].[contenthash:8][ext]' : 'assets/[name][ext]',
      clean: true,
      publicPath: '/',
    },

    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? false : 'eval-source-map',

    devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 3000,
      open: true,
      hot: true,
      historyApiFallback: true,
      client: {
        overlay: true,
      },
    },

    module: {
      rules: [
        // JavaScript
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: {
                    browsers: ['> 1%', 'last 2 versions', 'not dead']
                  },
                  useBuiltIns: 'usage',
                  corejs: 3,
                }]
              ]
            }
          }
        },

        // CSS
        {
          test: /\.css$/,
          use: [
            isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    ['postcss-preset-env', {
                      autoprefixer: { grid: true },
                      features: {
                        'custom-properties': false
                      }
                    }]
                  ]
                }
              }
            }
          ]
        },

        // Images - with optimization
        {
          test: /\.(png|jpe?g|gif|webp|avif)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 4 * 1024, // 4kb - smaller threshold for better caching
            },
          },
          generator: {
            filename: isProduction ? 'images/[name].[contenthash:8][ext]' : 'images/[name][ext]',
          },
        },

        // SVG - inline small, file for large
        {
          test: /\.svg$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 2 * 1024, // 2kb
            },
          },
          generator: {
            filename: isProduction ? 'images/[name].[contenthash:8][ext]' : 'images/[name][ext]',
          },
        },

        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: 'asset/resource',
          generator: {
            filename: isProduction ? 'fonts/[name].[contenthash:8][ext]' : 'fonts/[name][ext]',
          },
        },

        // HTML
        {
          test: /\.html$/,
          use: 'html-loader',
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/index.html',
        filename: 'index.html',
        inject: 'body',
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

      // Copy SEO and PWA files
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/robots.txt',
            to: 'robots.txt'
          },
          {
            from: 'src/sitemap.xml',
            to: 'sitemap.xml'
          },
          {
            from: 'src/site.webmanifest',
            to: 'site.webmanifest'
          }
        ]
      }),

      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: 'css/[name].[contenthash:8].css',
          chunkFilename: 'css/[name].[contenthash:8].chunk.css',
        }),
        // Gzip compression
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg)$/,
          threshold: 1024,
          minRatio: 0.8,
        }),
        // Brotli compression
        new CompressionPlugin({
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css|html|svg)$/,
          threshold: 1024,
          minRatio: 0.8,
        }),
      ] : []),

      ...(env && env.analyze ? [new BundleAnalyzerPlugin()] : []),
    ],

    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
            },
            mangle: {
              safari10: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
          parallel: true,
        }),
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: { removeAll: true },
                normalizeWhitespace: true,
              },
            ],
          },
        }),
        // Image optimization
        new ImageMinimizerPlugin({
          minimizer: {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              encodeOptions: {
                jpeg: { quality: 80 },
                webp: { quality: 80 },
                avif: { quality: 65 },
                png: { compressionLevel: 9 },
              },
            },
          },
          generator: [
            {
              // Generate WebP versions
              preset: 'webp',
              implementation: ImageMinimizerPlugin.sharpGenerate,
              options: {
                encodeOptions: {
                  webp: { quality: 80 },
                },
              },
            },
          ],
        }),
      ],
      
      splitChunks: {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
      
      runtimeChunk: 'single',
      moduleIds: 'deterministic',
    },

    resolve: {
      extensions: ['.js', '.css', '.html'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@images': path.resolve(__dirname, 'src/assets/images'),
      },
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 300000,
      maxAssetSize: 300000,
    },

    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    },
  };
}; 