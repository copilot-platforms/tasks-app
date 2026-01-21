/**
 * Jest config in plain JS so running tests doesn't require `ts-node`.
 * (Jest can load TS configs, but only when ts-node is installed.)
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@api/(.*)$': '<rootDir>/src/app/api/$1',
  },
}

module.exports = createJestConfig(config)

