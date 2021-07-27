'use strict'

const { overrides } = require('@netlify/eslint-config-node')

module.exports = {
  extends: '@netlify/eslint-config-node',
  // TODO: remove after https://github.com/netlify/eslint-config-node/pull/230 is merged and released
  rules: {
    'node/no-unsupported-features/es-syntax': [
      'error',
      {
        ignores: ['modules'],
      },
    ],
  },
  overrides: [
    ...overrides,
    {
      files: 'test/*.js',
      rules: {
        'no-magic-numbers': 'off',
        'promise/prefer-await-to-callbacks': 'off',
      },
    },
    // TODO: remove after https://github.com/netlify/eslint-config-node/pull/230 is merged and released
    {
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended', 'plugin:import/typescript'],
    },
  ],
  settings: {
    // TODO: remove after https://github.com/netlify/eslint-config-node/pull/230 is merged and released
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
}
