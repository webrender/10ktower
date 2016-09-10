var express = require('express');
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var app = express();

app.use(compression());
app.use(express.static('dist'));

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views','./dist');

app.get('/', function (req, res) {
    if (req.query.f) {
        // floor page
        floor(req,res);
    } else if (req.query.t) {
        // tick handler
        tick(req,res);
    } else {
        // static page
        index(req,res);
    }
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});

var tick = function(req, res) {
    // tick eval goes here
    if (req.xhr) {
        // ajax request, return HTML blocks
        res.send(JSON.stringify({'foo':'bar'}));
    } else {
        // http request, redirect to static index
        var path = '/';
        if (req.query.l)
            path = '/?l=' + req.query.l;
        res.redirect(path);
    }
}

var floor = function(req, res) {
    // if floor doesnt exist, add floor
    // if floor exists but unit is null, present unit selection dialog
    // if floor exists, unit is null, 'u' parameter exists, create unit on floor (or delete unit)
    // if floor & unit exist, present floor info
}

var index = function(req, res) {
    res.render('index', {name: 'mytower'});
}
