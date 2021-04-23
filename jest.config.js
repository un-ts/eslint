module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    'eslint-plugin-markup': '<rootDir>/packages/markup/src',
  },
  modulePathIgnorePatterns: ['<rootDir>/package.json'],
}
