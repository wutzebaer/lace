const path = require('node:path');

const { DefinePlugin, NormalModuleReplacementPlugin } = require('webpack');

const { withMaybeSentry } = require('../webpack-utils');

const { outputDirectory } = require('./common.webpack.config');

// Firefox runs the background as an event page (a document), where the
// webworker chunk loader's importScripts() does not exist.
const isFirefox = process.env.BROWSER === 'firefox';

module.exports = {
  target: isFirefox ? 'web' : 'webworker',
  entry: {
    'sw-script': withMaybeSentry(
      path.join(__dirname, '..', '..', 'src/sw-script/index.ts'),
    ),
  },
  output: {
    path: path.join(outputDirectory, 'js', 'sw'),
    publicPath: isFirefox ? '/js/sw/' : process.env.WEBPACK_PUBLIC_PATH,
  },
  module: {
    rules: [
      {
        test: /[\\/]@midnightntwrk[\\/]wallet-sdk-indexer-client[\\/]dist[\\/]effect[\\/]DeflateWebSocket\.js$/,
        use: [
          path.join(__dirname, '..', 'midnight-indexer-transport-loader.js'),
        ],
      },
    ],
  },
  plugins: [
    // MV3 forbids remotely hosted code. @sentry/browser's lazyLoadIntegration
    // embeds "https://browser.sentry-cdn.com" even when unused — tree-shaking
    // doesn't drop it. Replace it with a stub so the string never ships.
    new NormalModuleReplacementPlugin(
      /[\\/]@sentry[\\/]browser[\\/].*[\\/]utils[\\/]lazyLoadIntegration\.js$/,
      path.join(__dirname, '..', 'sentry-lazy-load-stub.js'),
    ),
    ...(process.env.EXTRA_FEATURE_FLAGS
      ? [
          new DefinePlugin({
            'process.env.EXTRA_FEATURE_FLAGS': JSON.stringify(
              process.env.EXTRA_FEATURE_FLAGS,
            ),
          }),
        ]
      : []),
  ],
};
