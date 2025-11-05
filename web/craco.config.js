const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('@tailwindcss/postcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.modules = [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '..'),
        'node_modules'
      ];
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
      return webpackConfig;
    },
  },
};