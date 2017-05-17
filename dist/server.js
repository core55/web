var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');

app = express();

var enforce = require('express-sslify');
app.use(enforce.HTTPS({ trustProtoHeader: true }));

app.use(serveStatic(__dirname));

var port = process.env.PORT || 5000;
app.listen(port);

console.log('server started '+ port);
