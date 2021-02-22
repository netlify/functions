'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  rules: {},
  overrides: [
    ...overrides,
    {
      files: 'test/*.js',
      rules: {
        'no-magic-numbers': 'off',
        'promise/prefer-await-to-callbacks': 'off',
      },
    },
  ],
}
