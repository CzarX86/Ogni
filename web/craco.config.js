const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '..'),
        'node_modules'
      ];
      return webpackConfig;
    },
  },
};