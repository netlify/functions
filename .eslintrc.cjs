'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  rules: {
    'max-statements': 'off',
  },
  overrides: [
    ...overrides,
    {
      files: 'test/**/*.+(t|j)s',
      rules: {
        'no-magic-numbers': 'off',
        'no-undef': 'off',
        'promise/prefer-await-to-callbacks': 'off',
        'unicorn/filename-case': 'off',
        'unicorn/consistent-function-scoping': 'off',
      },
    },
  ],
}
