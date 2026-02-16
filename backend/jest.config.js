module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/database/**',
  ],
  coverageDirectory: 'coverage',
  restoreMocks: true,
};
