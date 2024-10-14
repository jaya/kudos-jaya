const { resolve } = require('path');
const root = resolve(__dirname);
module.exports = {
  rootDir: root,
  displayName: 'root-tests',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  testEnvironment: 'node',
  clearMocks: true,
  preset: 'ts-jest',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@test/(.*)': '<rootDir>/test/$1',
  },
  coverageReporters: ['clover', 'lcov', 'text-summary', 'text', 'cobertura'],
  collectCoverageFrom: ['<rootDir>/src/**/{!(index|app), *}.ts'],
  transformIgnorePatterns: ['node_modules/(?!axios)'],
};
