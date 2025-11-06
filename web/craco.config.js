const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@shared': path.resolve(__dirname, '../shared'),
      };
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/index.tsx',
        '!src/serviceWorkerRegistration.ts',
      ],
    },
  },
};