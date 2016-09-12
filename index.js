var express = require('express');
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var fs = require('fs');

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
        res.send(fs.readFileSync('tower.json', 'utf8'));
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
    fs.readFile('tower.json', 'utf8', function(err, data) {
        tower = JSON.parse(data);

        if (req.query.l)
            var l = req.query.l < 14 ? 14 : req.query.l;

        //tower floor calc
        idx = l && tower.floors.length >= l ? l : tower.floors.length;
        tower.floor = function() {
            floor = idx;
            idx--;
            var str = "" + floor
            var pad = "00"
            floor = pad.substring(0, pad.length - str.length) + str
            return floor;
        }

        if (tower.floors.length > 14) {
            var start = l ? (tower.floors.length - l) : 0;
            start = start < 0 ? 0 : start;
            start = l < 14 ? 0 : start;
            tower.staticFloors = tower.floors.slice(start, start+14);
        } else {
            tower.staticFloors = tower.floors;
        }

        tower.floorClass = function() {
            var ret = ""
            switch(this.type) {
                case 'Office':
                    ret = '-o';
                    break;
                case 'Condo':
                    ret = '-c';
                    break;
                case 'Hotel':
                    ret = '-h';
                    break;
                case 'Housekeeping':
                    ret = '-m';
                    break;
                case 'Restaurant':
                    ret = '-r';
                    break;
            }
            if (this.occupied === false ) {
                ret += ' -e';
            }
            return ret;
        }

        tower.qolHtml = function() {
            if (this.qol) {
                if (this.occupied) {
                    switch (this.qol) {
                        case 'good':
                            return '<img src="i.svg" class="h" alt=":)">';
                            break;
                        case 'bad':
                            return '<img src="i.svg" class="s" alt=":(">';
                            break;
                        case 'neutral':
                            return '<img src="i.svg" class="n" alt=":|">';
                            break;
                    }
                } else {
                    return '<img src="i.svg" class="e" alt=" &nbsp;&nbsp; ">';
                }
            } else {
                return '<span class="sp"> &nbsp;&nbsp; </span>';
            }
        }

        tower.typeHtml = function() {
            if (this.occupied === false) {
                return this.type;
            } else {
                switch (this.type) {
                    case 'Restaurant':
                    case 'Shop':
                    case 'Theatre':
                        return '<strong>'+this.type+'</strong>';
                        break;
                    case 'Security':
                    case 'Medical':
                    case 'Housekeeping':
                        return '<i>'+this.type+'</i>';
                        break;
                    case 'Condo':
                        return '<b>Condo</b>';
                        break;
                    case 'Hotel':
                        return '<tt>Hotel</tt>';
                        break;
                    case 'Office':
                        return '<code>Office</code>';
                        break;
                    default:
                        return this.type;
                        break;
                }
            }
        }

        tower.floorPadding = function() {
            var numSpaces = 13 - this.type.length;
            var paddingStr = "";
            for (i=0; i<numSpaces; i++) {
                paddingStr += "&nbsp;";
            }
            return paddingStr;
        }

        tower.floorDown = function () {
            var topFloor = parseInt(l && tower.floors.length >= l ? l : tower.floors.length);
            var botFloor = topFloor - 13 > 1 ? topFloor - 13 : 1;
            if (botFloor == 1) {
                return false;
            }
            var beg, end;
            if (botFloor - 14 < 1) {
                beg = 1;
                end = 14;
            } else {
                beg = botFloor - 14;
                end = botFloor - 1;
            }
            var numSpaces = 7 - beg.toString().length - end.toString().length;
            var begPad = "";
            var endPad = "";
            for (i=0; i<numSpaces; i++) {
                if (begPad.length > endPad.length) {
                    endPad += "&nbsp;";
                } else {
                    begPad += "&nbsp;";
                }
            }
            console.log(begPad, endPad);
            return {"beg":beg, "end":end, "begPad":begPad, "endPad":endPad}
        }

        tower.floorUp = function () {
            var topFloor = parseInt(l && tower.floors.length >= l ? l : tower.floors.length);
            var botFloor = topFloor - 13 > 1 ? topFloor - 13 : 1;
            if (topFloor + 1 > tower.floors.length) {
                return false;
            }
            var beg, end;
            if (topFloor + 14 > tower.floors.length) {
                beg = topFloor + 1;
                end = tower.floors.length;
            } else {
                beg = topFloor + 1;
                end = topFloor + 14;
            }
            var numSpaces = 7 - beg.toString().length - end.toString().length;
            var begPad = "";
            var endPad = "";
            for (i=0; i<numSpaces; i++) {
                if (begPad.length > endPad.length) {
                    endPad += "&nbsp;";
                } else {
                    begPad += "&nbsp;";
                }
            }
            return {"beg":beg, "end":end, "begPad":begPad, "endPad":endPad}
        }

        res.render('index', tower);
    });
}
