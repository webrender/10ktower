var express = require('express');
var compression = require('compression');
var app = express();

app.use(compression());
app.use(express.static('dist'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
