const path = require("path");
const okta_config = require("./openid-okta-config");
// Users can also provide the testenv configuration at the root folder: https://www.npmjs.com/package/dotenv
require("dotenv").config({ path: path.join(__dirname, "testenv") });

let ISSUER = process.env.ISSUER || okta_config.issuer;
let CLIENT_ID = process.env.CLIENT_ID;
let CLIENT_SECRET = process.env.CLIENT_SECRET;

let SPA_CLIENT_ID = process.env.SPA_CLIENT_ID || "{spaClientId}";
let OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK
  ? true
  : false;

module.exports = {
  webServer: {
    port: 8080,
    oidc: {
      clientId: "0oa1i7ei2iXXI6VPp357",
      clientSecret: "-fnhLpcl99-wsxTSw0FjCqTNAiW-QDE8iwzewWqG",
      issuer: "https://dev-679740.okta.com/oauth2/default",
      appBaseUrl: "http://localhost:8080",
      scope: "openid profile email"
    }
  },
  resourceServer: {
    port: 8000,
    oidc: {
      clientId: "0oa1i7jp286n4kMhm357",
      issuer: "https://webshield.okta.com"
    },
    assertClaims: {
      aud: "api://default",
      cid: "0oa1i7jp286n4kMhm357"
    }
  }
};
