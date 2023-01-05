// Own module to contain deployment-specific server.js information
const serverConfiguration = require("./serverConfiguration.js");

const path = require("path");
const express = require("express");
const helmet = require("helmet");

const DIST_DIR = path.join(__dirname, "public");
const PORT = 80;
const app = express();

//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

// Tweak rules so that it allows off-site logo & sourire images
app.use(helmet.contentSecurityPolicy( serverConfiguration.contentSecurityPolicy ));
// app.use(helmet.crossOriginEmbedderPolicy());
// app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());


//Send index.html when the user access the web
app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT);
