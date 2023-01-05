"use strict"

const serverConfiguration = {

// Sets the content Security Policy in helmet
// Basically, define which sources are allowed to come from which locations
// This is a default value that works with a local host, Spark Jobserver and a Sourire instance
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["localhost:3080", "localhost:8090"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "localhost:9999", "www.data-intuitive.com"],
    }
  }
}

exports = serverConfiguration
module.exports = serverConfiguration

exports["default"] = serverConfiguration
