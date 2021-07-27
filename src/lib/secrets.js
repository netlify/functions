const https = require("https");
const process = require("process");
const { ONEGRAPH_AUTHLIFY_APP_ID } = require("./consts");

function camelize(text) {
  text = text.replace(/[-_\s.]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
  return text.substr(0, 1).toLowerCase() + text.substr(1);
}

// The services will be camelized versions of the OneGraph service enums
// unless overridden by the serviceNormalizeOverrides object
const serviceNormalizeOverrides = {
  // Keys are the OneGraph service enums, values are the desired `secret.<service>` names
  GITHUB: "gitHub",
};

function oneGraphRequest(secretToken, body) {
  return new Promise((resolve, reject) => {
    const options = {
      host: "serve.onegraph.com",
      path: "/graphql?app_id=" + ONEGRAPH_AUTHLIFY_APP_ID,
      port: 443,
      method: "POST",
      headers: {
        Authorization: "Bearer " + secretToken,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Content-Length": body ? Buffer.byteLength(body) : 0,
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(res.statusCode));
      }

      var body = [];

      res.on("data", function (chunk) {
        body.push(chunk);
      });

      res.on("end", function () {
        const data = Buffer.concat(body).toString();
        try {
          body = JSON.parse(data);
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });

    req.on("error", (e) => {
      reject(e.message);
    });

    req.write(body);

    req.end();
  });
}

let secrets = {};

// Note: We may want to have configurable "sets" of secrets,
// e.g. "dev" and "prod"
const getSecrets = async () => {
  const secretToken = process.env.ONEGRAPH_AUTHLIFY_TOKEN;

  if (!secretToken) {
    return {};
  }

  // Cache in memory for the life of the serverless process
  if (secrets[secretToken]) {
    return secrets[secretToken];
  }

  const doc = `query FindLoggedInServicesQuery {
    me {
      serviceMetadata {
        loggedInServices {
          friendlyServiceName
          service
          isLoggedIn
          bearerToken
        }
      }
    }
  }`;

  const body = JSON.stringify({ query: doc });

  const result = await oneGraphRequest(
    secretToken,
    new TextEncoder().encode(body)
  );

  const services =
    result.data &&
    result.data.me &&
    result.data.me.serviceMetadata &&
    result.data.me.serviceMetadata.loggedInServices;

  if (services) {
    const newSecrets = services.reduce((acc, service) => {
      const normalized =
        serviceNormalizeOverrides[service.service] ||
        camelize(service.friendlyServiceName);
      acc[normalized] = service;
      return acc;
    }, {});

    secrets[secretToken] = newSecrets;
    return newSecrets;
  } else {
    return {};
  }
};

// eslint-disable-next-line promise/prefer-await-to-callbacks
const withSecrets = (handler) => async (event, context, callback) => {
  const secrets = await getSecrets();

  return handler(event, { ...context, secrets }, callback);
};

module.exports = {
  // Fine-grained control during the preview, less necessary with a more proactive OneGraph solution
  getSecrets,
  // The common usage of this module
  withSecrets,
};
