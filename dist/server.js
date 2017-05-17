var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

app = express();
app.use(serveStatic(__dirname));

function enforceHttps(req, res, next) {
  if (req.headers['x-forwarded-proto'] != 'https') {
    res.redirect(status, 'https://' + req.hostname + req.originalUrl);
    return;
  }

  next();
}

// enable ssl redirect
app.use(enforceHttps());

var port = process.env.PORT || 5000;
app.listen(port);

console.log('server started '+ port);
