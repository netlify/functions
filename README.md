# ![functions](functions.png)

[![Build](https://github.com/netlify/functions/workflows/Build/badge.svg)](https://github.com/netlify/functions/actions)
[![Node](https://img.shields.io/node/v/@netlify/functions.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/functions)

JavaScript and TypeScript utilities for [Netlify Functions](https://docs.netlify.com/functions/overview/).

## Installation

```
npm install @netlify/functions
```

## Usage

### On-demand Builders

To use On-demand Builders, wrap your function handler with the `builder` function.

- With JavaScript:

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

- With TypeScript:

  ```ts
  import { builder, Handler } from '@netlify/functions'

  const myHandler: Handler = async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Hello World' }),
    }
  }

  const handler = builder(myHandler)

  export { handler }
  ```

### TypeScript typings

This module exports typings for authoring Netlify Functions in TypeScript.

```ts
import { Handler } from '@netlify/functions'

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World' }),
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


## {feature_name}

**Note: This feature is currently in beta under Netlify Labs**

To make building on and interacting with third-party APIs as simple and powerful as possible, Netlify provides API secret provisioning and management, powered by [OneGraph](https://www.onegraph.com). It’s enabled on a per-site basis under [Netlify labs](https://app.netlify.com/user/labs) tab, where you can use the Netlify UI to select which services you want to make available for your functions or site builds, and which scopes you need access to.

### Usage

After you’ve enabled one or more services, you can access the relevant API tokens and secrets in your serverless functions with the `getSecrets` function exported from the `@netlify/functions` package.

> `getSecrets` is fully typed, so you’ll have in-editor autocomplete to explore everything that’s available, and to be confident that you’re handling all of the edge cases

  ```js
    import { getSecrets } from "@netlify/functions";
    
    export const handler = async (event) => {
      // Handle all fetching, refreshing, rotating, etc. of tokens
      const secrets = await getSecrets();
    
      // Check if the GitHub auth has been enabled for the site
      if (!secrets.gitHub?.bearerToken) {
        return {
          statusCode: 412,
          body: JSON.stringify({
            error: "You must enable the GitHub auth in your Netlify dashboard",
          }),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    
      // If so, we can make calls to the GitHub API - REST or GraphQL!
      const MyOctokit = Octokit.plugin(restEndpointMethods);
      const octokit = new MyOctokit({ auth: secrets.gitHub.bearerToken });
    
      // We'll list all open issues on the netlify/functions repository
      const result = await octokit.rest.issues.list({
        owner: "netlify",
        repo: "functions",
        state: "open",
      });
    
      return {
        statusCode: 200,
        body: JSON.stringify(result),
        headers: {
          "Content-Type": "application/json",
        },
      };
    };
  ```

### Checking additional metadata about auth token in your functions and site builds

{feature_name} also tracks metadata for installed auth tokens. You can verify that an auth has been installed with the correct scopes before calling into an API (say, for example, to give a better error message in the developer logs). Here's an example:

  ```js
    import { getSecrets } from "@netlify/functions";
    
    export const handler = async (event) => {
      // Handle all fetching, refreshing, rotating, etc. of tokens
      const secrets = await getSecrets();
    
      // We know that we need either "public_repo" or "repo" scopes granted
      // in order to run this function properly
      const sufficientScopes = ["public_repo", "repo"];
    
      // Secrets have an optional `grantedScopes` field that has details
      // on what the auth is allowed to do
      const tokenHasScope = secrets.gitHub.grantedScopes?.some((grantedScope) =>
        sufficientScopes.includes(grantedScope.scope)
      );
    
      // Notice how we can leave a great error message that tells us exactly what
      // we need to do to fix things.
      if (!tokenHasScope) {
        return {
          statusCode: 412,
          body: JSON.stringify({
            error: `You have enabled GitHub auth in your Netlify Auth dashboard, but it's missing a required scope. The auth must have one (or both) of the scopes: ${sufficientScopes.join(", ")}`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        };
      }
    
     // ...
    }
  ```

### Accessing integration auth tokens during development

When running your site under `netlify dev`, the environmental variables that power the auth management will be synced, and you can transparently develop against the third party APIs - no additional configuration necessary!

### Updating or removing auth tokens from your site

At any time you can revisit the {feature_name} tab for your site in [Netlify Labs](https://app.netlify.com/user/labs) (select your profile avatar, then Netlify Labs) to see the installed auth. From there, you can select new scopes for already-installed auth and then run through the browser-based auth flow again, and the new scopes will be available to all your existing, deployed functions and site builds _instantly_.

You can also install new services or remove currently-installed services you’re no longer using.

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
