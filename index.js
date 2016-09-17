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

//   /$$   /$$           /$$
//  | $$  | $$          | $$
//  | $$  | $$  /$$$$$$ | $$  /$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$$
//  | $$$$$$$$ /$$__  $$| $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$_____/
//  | $$__  $$| $$$$$$$$| $$| $$  \ $$| $$$$$$$$| $$  \__/|  $$$$$$
//  | $$  | $$| $$_____/| $$| $$  | $$| $$_____/| $$       \____  $$
//  | $$  | $$|  $$$$$$$| $$| $$$$$$$/|  $$$$$$$| $$       /$$$$$$$/
//  |__/  |__/ \_______/|__/| $$____/  \_______/|__/      |_______/
//                          | $$
//                          | $$
//                          |__/

// Derive time periods from ticks
var t_daytime = function(tower){return tower.ticks % 2 == 0};
var t_nighttime = function(tower){return tower.ticks % 2 > 0};
var t_quarter = function(tower){return tower.ticks % 90 == 0};
var t_year = function(tower){return tower.ticks % 360 == 0};

// Population Model
var pop = function(idx) {
    if (idx){
        switch(tower.floors[idx].type) {
            case 'Condo':
                if (tower.floors[idx].tenants.occupied) {
                    return 3;
                } else {
                    return 0;
                }
                break;
            case 'Office':
                if (!tower.floors[idx].tenants.occupied && tower.ticks % 0) {
                    return 0;
                } else {
                    return 6;
                }
                break;
            case 'Hotel':
                if (t_nighttime(tower)) {
                    switch(tower.floors[idx].tenants.qol){
                        case 'Good':
                            return 2;
                            break;
                        case 'Neutral':
                            return 1;
                            break;
                        case 'Bad':
                            return 0;
                            break;
                    }
                    return 0;
                } else {
                    return 0;
                }
                break;
            case 'Restaurant':
                if (t_nighttime(tower)) {
                    return 0;
                } else {
                    switch(tower.floors[idx].tenants.qol){
                        case 'Good':
                            return 50;
                            break;
                        case 'Neutral':
                            return 35;
                            break;
                        case 'Bad':
                            return 20;
                            break;
                    }
                    return 0;
                }
                break;
            case 'Shop':
                if (t_nighttime(tower)) {
                    return 0;
                } else {
                    switch(tower.floors[idx].tenants.qol){
                        case 'Good':
                            return 50;
                            break;
                        case 'Neutral':
                            return 35;
                            break;
                        case 'Bad':
                            return 20;
                            break;
                    }
                    return 0;
                }
                break;
            case 'Theatre':
                if (t_nighttime(tower)) {
                    return 0;
                } else {
                    switch(tower.floors[idx].tenants.qol){
                        case 'Good':
                            return 120;
                            break;
                        case 'Neutral':
                            return 75;
                            break;
                        case 'Bad':
                            return 10;
                            break;
                    }
                    return 0;
                }
                break;
            case 'Housekeeping':
            case 'Security':
            case 'Medical':
                return 0;
                break;
        }
    }
    return false;
}

// Revenue Model
var rev = function(idx) {
    if (idx){
        switch(tower.floors[idx].type) {
            case 'Condo':
                if (tower.floors[idx].tenants.occupied) {
                    return {'single':true, amount:100000};
                } else {
                    return 0;
                }
                break;
            case 'Office':
                if (tower.floors[idx].tenants.occupied) {
                    return {'single':true, amount:10000};
                } else {
                    return 0;
                }
                break;
            case 'Hotel':
                if (tower.floors[idx].tenants.occupied) {
                    switch(tower.floors[idx].tenants.qol){
                        case 'Good':
                            return {'daily':true, amount:3000};
                            break;
                        case 'Neutral':
                            return {'daily':true, amount: 2000};
                            break;
                        case 'Bad':
                            return {'daily':true, amount: 800};
                            break;
                    }
                }
                return {'daily':true, amount: 0};
                break;
            case 'Restaurant':
                switch(tower.floors[idx].tenants.qol){
                    case 'Good':
                        return {'daily':true, amount: 10000};
                        break;
                    case 'Neutral':
                        return {'daily':true, amount: 4000};
                        break;
                    case 'Bad':
                        return {'daily':true, amount: -2000};
                        break;
                }
                return 0;
                break;
            case 'Shop':
                switch(tower.floors[idx].tenants.qol){
                    case 'Good':
                        return {'daily':true, amount: 20000};
                        break;
                    case 'Neutral':
                        return {'daily':true, amount: 10000};
                        break;
                    case 'Bad':
                        return {'daily':true, amount: -4000};
                        break;
                }
                return 0;
                break;
            case 'Theatre':
                switch(tower.floors[idx].tenants.qol){
                    case 'Good':
                        return {'daily':true, amount: 40000};
                        break;
                    case 'Neutral':
                        return {'daily':true, amount: 10000};
                        break;
                    case 'Bad':
                        return {'daily':true, amount: 0};
                        break;
                }
                return 0;
                break;
            case 'Housekeeping':
                return {'quarter':true, amount: 10000};
                break;
            case 'Security':
            case 'Medical':
                return {'quarter':true, amount: 20000};
                break;
        }
    }
    return false;
}
//  /$$$$$$$                        /$$     /$$
// | $$__  $$                      | $$    |__/
// | $$  \ $$  /$$$$$$  /$$   /$$ /$$$$$$   /$$ /$$$$$$$   /$$$$$$
// | $$$$$$$/ /$$__  $$| $$  | $$|_  $$_/  | $$| $$__  $$ /$$__  $$
// | $$__  $$| $$  \ $$| $$  | $$  | $$    | $$| $$  \ $$| $$  \ $$
// | $$  \ $$| $$  | $$| $$  | $$  | $$ /$$| $$| $$  | $$| $$  | $$
// | $$  | $$|  $$$$$$/|  $$$$$$/  |  $$$$/| $$| $$  | $$|  $$$$$$$
// |__/  |__/ \______/  \______/    \___/  |__/|__/  |__/ \____  $$
//                                                        /$$  \ $$
//                                                       |  $$$$$$/
//                                                        \______/

app.get('/', function (req, res) {
    if (req.query.f) {
        // level` page
        level(req,res);
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

//  /$$$$$$$$ /$$           /$$
// |__  $$__/|__/          | $$
//    | $$    /$$  /$$$$$$$| $$   /$$
//    | $$   | $$ /$$_____/| $$  /$$/
//    | $$   | $$| $$      | $$$$$$/
//    | $$   | $$| $$      | $$_  $$
//    | $$   | $$|  $$$$$$$| $$ \  $$
//    |__/   |__/ \_______/|__/  \__/

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

//  /$$                                     /$$
// | $$                                    | $$
// | $$        /$$$$$$  /$$    /$$ /$$$$$$ | $$
// | $$       /$$__  $$|  $$  /$$//$$__  $$| $$
// | $$      | $$$$$$$$ \  $$/$$/| $$$$$$$$| $$
// | $$      | $$_____/  \  $$$/ | $$_____/| $$
// | $$$$$$$$|  $$$$$$$   \  $/  |  $$$$$$$| $$
// |________/ \_______/    \_/    \_______/|__/

var level = function(req, res) {
    fs.readFile('tower.json', 'utf8', function(err, data) {
        tower = JSON.parse(data);

        if (req.query.f > tower.floors.length) {
            // floor doesn't exist - add floor
            if (tower.cash >= 500) {
                tower.cash = tower.cash - 500
                tower.floors.push({});
                fs.writeFile('tower.json', JSON.stringify(tower), 'utf8', function() {
                    res.redirect('/');
                });
            } else {
                // need an error state
                res.redirect('/?l=' + req.query.f);
            }
        } else {
            var idx = req.query.f - 1;
            if (tower.floors[idx].type) {
                //floor info
                var floor = tower.floors[idx];
                floor.level = req.query.f;
                floor.pop = pop(idx);
                floor.rev = rev(idx);
                //cost - occupied condos must be bought back from owners
                floor.cost = tower.floors[idx].type == 'Condo' &&
                        tower.floors[idx].occupied == true ?
                        true :
                        false;
                res.render('floor', floor);
            } else {
                //empty floor
                if (req.query.u) {
                    if (req.query.u == 'x') {
                        // delete unit
                    } else {
                        // picker submission
                        var type, cost, tenants;
                        switch (req.query.u){
                            case 'c':
                                type = 'Condo';
                                tenants = true;
                                cost = 80000;
                                break;
                            case 'o':
                                type = 'Office';
                                tenants = true;
                                cost = 40000;
                                break;
                            case 'h':
                                type = 'Hotel';
                                tenants = true;
                                cost = 50000;
                                break;
                            case 'm':
                                type = 'Housekeeping';
                                cost = 50000;
                                break;
                            case 'p':
                                type = 'Security';
                                cost = 100000;
                                break;
                            case 'd':
                                type = 'Medical';
                                cost = 500000;
                                break;
                            case 'r':
                                type = 'Restaurant';
                                tenants = true;
                                cost = 100000;
                                break;
                            case 's':
                                type = 'Shop';
                                tenants = true;
                                cost = 100000;
                                break;
                            case 't':
                                type = 'Theatre';
                                tenants = true;
                                cost = 500000;
                                break;
                        }
                        tower.floors[idx] = {
                            type: type
                        }
                        if (tenants) {
                            tower.floors[idx].tenants = {occupied: false};
                        }
                        if (tower.cash >= cost) {
                            tower.cash = tower.cash - cost;
                            fs.writeFile('tower.json', JSON.stringify(tower), 'utf8', function() {
                                res.redirect('/?l=' + req.query.f);
                            });
                        } else {
                            // need an error state
                            res.redirect('/?l=' + req.query.f);
                        }
                    }
                } else {
                    // picker
                    res.render('picker',{floor: idx+1});
                }
            }
        }
    });
}

//   /$$$$$$   /$$                 /$$     /$$
//  /$$__  $$ | $$                | $$    |__/
// | $$  \__//$$$$$$    /$$$$$$  /$$$$$$   /$$  /$$$$$$$
// |  $$$$$$|_  $$_/   |____  $$|_  $$_/  | $$ /$$_____/
//  \____  $$ | $$      /$$$$$$$  | $$    | $$| $$
//  /$$  \ $$ | $$ /$$ /$$__  $$  | $$ /$$| $$| $$
// |  $$$$$$/ |  $$$$/|  $$$$$$$  |  $$$$/| $$|  $$$$$$$
//  \______/   \___/   \_______/   \___/  |__/ \_______/

var index = function(req, res) {
    fs.readFile('tower.json', 'utf8', function(err, data) {
        tower = JSON.parse(data);
        tower.floors = tower.floors.reverse();
        tower.height = tower.floors.length + 1;

        if (req.query.l)
            var l = req.query.l < 14 ? 14 : req.query.l;

        //tower floor calc
        var idx = l && tower.floors.length >= l ? l : tower.floors.length;
        var floor;

        tower.population = function() {
            var population = 0;
            for (i=0; i<tower.floors.length; i++) {
                population += pop(i);
            }
            return population;
        }

        tower.floor = function() {
            floor = idx;
            idx--;
            return floor;
        }

        tower.floor_padded = function() {
            var str = "" + floor;
            var pad = "00";
            floor_padded = pad.substring(0, pad.length - str.length) + str;
            return floor_padded;
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
                case 'Medical':
                    ret = '-d';
                    break;
                case 'Security':
                    ret = '-p';
                    break;
                case 'Restaurant':
                    ret = '-r';
                    break;
                case 'Shop':
                    ret = '-s';
                    break;
                case 'Theatre':
                    ret = '-t';
                    break;
            }
            if (this.tenants && this.tenants.occupied === false || !this.type ) {
                ret += ' -e';
            }
            return ret;
        }

        tower.qolHtml = function() {
            if (this.tenants && this.tenants.qol) {
                switch (this.tenants.qol) {
                    case 'Good':
                        return '<img src="i.svg" class="h" alt=":)">';
                        break;
                    case 'Bad':
                        return '<img src="i.svg" class="s" alt=":(">';
                        break;
                    case 'Neutral':
                        return '<img src="i.svg" class="n" alt=":|">';
                        break;
                }
            } else {
                return '<span class="sp"> &nbsp;&nbsp; </span>';
            }
        }

        tower.typeHtml = function() {
            if (this.tenants && this.tenants.occupied === false) {
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
                        return 'Empty Floor';
                        break;
                }
            }
        }

        tower.floorPadding = function() {
            if (this.type) {
                var numSpaces = this.type.length ? 13 - this.type.length : 13;
                var paddingStr = "";
                for (i=0; i<numSpaces; i++) {
                    paddingStr += "&nbsp;";
                }
                return paddingStr;
            }
            return '&nbsp;&nbsp;';
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

        tower.cashF = function() {
            return tower.cash.toLocaleString('en-US');
        }

        res.render('index', tower);
    });
}
