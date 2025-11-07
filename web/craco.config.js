const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        'shared': path.resolve(__dirname, 'src/shared'),
      };
      return webpackConfig;
    },
  },
  jest: {
    configure: {
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/**/*.{spec,test}.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
      ],
      testPathIgnorePatterns: [
        '/node_modules/',
        '/cypress/',
        '<rootDir>/tests/e2e/',
      ],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^shared/(.*)$': '<rootDir>/src/__mocks__/shared/$1',
        '^firebase/(.*)$': '<rootDir>/src/__mocks__/firebase/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/index.tsx',
        '!src/serviceWorkerRegistration.ts',
      ],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
      }
    },
  },
};