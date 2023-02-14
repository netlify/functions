'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  rules: {},
  overrides: [
    ...overrides,
    {
      files: 'test/**/*.+(t|j)s',
      rules: {
        'max-lines-per-function': 'off',
        'no-magic-numbers': 'off',
        'promise/prefer-await-to-callbacks': 'off',
        'unicorn/filename-case': 'off',
      },
    },
  ],
}
