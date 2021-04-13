# @netlify/functions

[![Build](https://github.com/netlify/functions-js/workflows/Build/badge.svg)](https://github.com/netlify/functions-js/actions)
[![Coverage Status](https://codecov.io/gh/netlify/functions-js/branch/main/graph/badge.svg)](https://codecov.io/gh/netlify/functions-js)
[![Node](https://img.shields.io/node/v/@netlify/functions.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/functions)

Development utilities for Netlify Functions.

## Installation

```
npm install @netlify/functions
```

## Usage

### On-demand Builders

To use On-demand Builders, wrap your function handler with the `builder` function.

```js
const { builder } = require('@netlify/functions')

const handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
  }
}

exports.handler = builder(handler)
```

### TypeScript typings

This module exports typings for authoring Netlify Functions in TypeScript.

```ts
import { Handler } from '@netlify/functions'

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" })
  }
}

export { handler }
```

The following types are exported:

- `Handler`
- `HandlerCallback`
- `HandlerContext`
- `HandlerEvent`
- `HandlerResponse`

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
