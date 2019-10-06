require("dotenv").config();

const log = require("ololog");
const express = require("express");
const session = require("express-session");
const mustacheExpress = require("mustache-express");
const path = require("path");
const { ExpressOIDC } = require("@okta/oidc-middleware");

const templateDir = path.join(__dirname, "..", "common", "views");
const frontendDir = path.join(__dirname, "..", "common", "assets");

module.exports = function SampleWebServer(
  sampleConfig,
  extraOidcOptions,
  homePageTemplateName
) {
  const oidc = new ExpressOIDC(
    Object.assign(
      {
        issuer: sampleConfig.oidc.issuer,
        client_id: sampleConfig.oidc.clientId,
        client_secret: sampleConfig.oidc.clientSecret,
        appBaseUrl: sampleConfig.oidc.appBaseUrl,
        scope: sampleConfig.oidc.scope,
        testing: sampleConfig.oidc.testing
      },
      extraOidcOptions || {}
    )
  );

  const app = express();

  app.use(
    session({
      secret: "this-should-be-very-random",
      resave: true,
      saveUninitialized: false
    })
  );

  // Provide the configuration to the view layer because we show it on the homepage
  const displayConfig = Object.assign({}, sampleConfig.oidc, {
    clientSecret:
      "****" +
      sampleConfig.oidc.clientSecret.substr(
        sampleConfig.oidc.clientSecret.length - 4,
        4
      )
  });

  app.locals.oidcConfig = displayConfig;

  // This server uses mustache templates located in views/ and css assets in assets/
  app.use("/assets", express.static(frontendDir));
  app.engine("mustache", mustacheExpress());
  app.set("view engine", "mustache");
  app.set("views", templateDir);

  app.use(oidc.router);

  app.get("/", (req, res) => {
    const template = homePageTemplateName || "home";
    const userinfo = req.userContext && req.userContext.userinfo;
    res.render(template, {
      isLoggedIn: !!userinfo,
      userinfo: userinfo
    });
  });

  app.get("/profile", oidc.ensureAuthenticated(), (req, res) => {
    // Convert the userinfo object into an attribute array, for rendering with mustache
    const userinfo = req.userContext && req.userContext.userinfo;
    log.lightYellow("/profile --> userInfo", userinfo);
    const attributes = Object.entries(userinfo);
    res.render("profile", {
      isLoggedIn: !!userinfo,
      userinfo: userinfo,
      attributes
    });
  });

  oidc.on("ready", () => {
    app.listen(sampleConfig.port, () =>
      log.cyan(`Sample-Web-Server listening on port ${sampleConfig.port}`)
    );
  });

  oidc.on("error", err => {
    // An error occurred with OIDC
    throw err;
  });
};
