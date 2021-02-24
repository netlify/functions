# @netlify/functions

[![Build](https://github.com/netlify/functions-js/workflows/Build/badge.svg)](https://github.com/netlify/functions-js/actions)
[![Coverage Status](https://codecov.io/gh/netlify/functions-js/branch/main/graph/badge.svg)](https://codecov.io/gh/netlify/functions-js)
[![Node](https://img.shields.io/node/v/@netlify/functions.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/functions)

JavaScript utilities for Netlify Functions.

## Installation

```
npm install @netlify/functions
```

## Usage

### Builder Functions

```js
const { builderFunction } = require('@netlify/functions')

const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  }
}

exports.handler = builderFunction(handler)
```

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
