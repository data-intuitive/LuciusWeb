var path = require("path");
var express = require("express");

var DIST_DIR = __dirname;
var PORT = 80;
var app = express();

//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

//Remove header to improve security
app.disable('x-powered-by');

//Send index.html when the user access the web
app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT);
