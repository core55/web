var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

app = express();
app.use(serveStatic(__dirname));

var enforceHttps = function(req, res, next) {
  if (req.headers['x-forwarded-proto'] != 'https' || !req.secure) {
    return res.redirect('https://' + req.headers.host + req.url);
  }

  next();
}

// enable ssl redirect
app.use(enforceHttps);

var port = process.env.PORT || 5000;
app.listen(port);

console.log('server started '+ port);
