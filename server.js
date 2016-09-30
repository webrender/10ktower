var express = require('express');
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var fs = require('fs');
var shortid = require('shortid');
var cookieParser = require('cookie-parser');

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

var app = express();

app.use(compression());
app.use(cookieParser());
app.use(express.static('dist'));

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views','./dist');

app.get('/', function(req,res){
	res.render('home', {tid: req.cookies.last_tower});
});

app.get('/new/', function(req, res) {
	var tid = shortid.generate();
	fs.writeFile('towers/'+tid+'.json', JSON.stringify({'ticks':0,'cash':200000,'floors':[]}), 'utf8', function() {
		res.redirect('/'+tid+'/');
	});
});

app.get('/about/', function(req, res) {
	res.render('about');
});

app.get('/:towerid/', function (req, res) {
	fs.readFile('towers/'+req.params.towerid+'.json', 'utf8', function(err) {
		if (err) {
			res.status(404).send('404: Tower Not Found');
			return false;
		} else {
			if (req.query.f) {
				// level page
				level(req,res);
			} else if (typeof(req.query.t) != 'undefined') {
				// tick handler
				tick(req,res);
			} else {
				// static page
				index(req,res);
			}
		}
	});
});

app.listen(3000, function () {
	console.log('10ktower listening on port 3000!'); //eslint-disable-line no-console
});

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
var t_daytime = function(tower){
	var tickDate = new Date(tower.ticks);
	if (tickDate.getHours() < 6 || tickDate.getHours() > 18)
		return false;
	return true;
};
var t_nighttime = function(tower){
	var tickDate = new Date(tower.ticks);
	if (tickDate.getHours() < 6 || tickDate.getHours() > 18)
		return true;
	return false;
};
var t_quarter = function(tower){
	tower.population = population(tower);
	var tickDate = new Date(tower.ticks);
	var days = Math.floor(tickDate/8.64e7);
	return days % 90 == 0;
};

var com = function(tower, i) {
	var total = 0;
	if (tower.floors[i+1]) {
		if (tower.floors[i+1].type == 'Restaurant' ||
			tower.floors[i+1].type == 'Shop' ||
			tower.floors[i+1].type == 'Theatre'
		) {
			total -= 3;
		}
	}
	if (tower.floors[i-1]) {
		if (tower.floors[i-1].type == 'Restaurant' ||
			tower.floors[i-1].type == 'Shop' ||
			tower.floors[i-1].type == 'Theatre'
		) {
			total -= 3;
		}
	}
	return total;
};

var r75 = function() { return Math.ceil(Math.random() * 100) < 75 ? true : false; };

//   /$$$$$$$
//  | $$__  $$
//  | $$  \ $$  /$$$$$$   /$$$$$$
//  | $$$$$$$/ /$$__  $$ /$$__  $$
//  | $$____/ | $$  \ $$| $$  \ $$
//  | $$      | $$  | $$| $$  | $$
//  | $$      |  $$$$$$/| $$$$$$$/
//  |__/       \______/ | $$____/
//                      | $$
//                      | $$
//                      |__/

// Population Model
var pop = function(tower, idx) {
	if (idx >= 0){
		switch(tower.floors[idx].type) {
		case 'Condo':
			if (tower.floors[idx].tenants.occupied) {
				return 3;
			} else {
				return 0;
			}
		case 'Office':
			if (!tower.floors[idx].tenants.occupied && t_nighttime) {
				return 0;
			} else {
				return 6;
			}
		case 'Hotel':
			if (t_nighttime(tower)) {
				switch(tower.floors[idx].tenants.qol){
				case 'Good':
					return 2;
				case 'Neutral':
					return 1;
				case 'Bad':
					return 0;
				}
				return 0;
			} else {
				return 0;
			}
		case 'Restaurant':
			if (t_nighttime(tower)) {
				return 0;
			} else {
				if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
					tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
				switch(tower.floors[idx].tenants.qol){
				case 'Good':
					return 50;
				case 'Neutral':
					return 35;
				case 'Bad':
					return 20;
				}
				return 0;
			}
		case 'Shop':
			if (t_nighttime(tower)) {
				return 0;
			} else {
				if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
					tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
				switch(tower.floors[idx].tenants.qol){
				case 'Good':
					return 50;
				case 'Neutral':
					return 35;
				case 'Bad':
					return 20;
				}
				return 0;
			}
		case 'Theatre':
			if (t_nighttime(tower)) {
				return 0;
			} else {
				if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
					tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
				switch(tower.floors[idx].tenants.qol){
				case 'Good':
					return 120;
				case 'Neutral':
					return 75;
				case 'Bad':
					return 10;
				}
				return 0;
			}
		case 'Housekeeping':
		case 'Security':
		case 'Medical':
			return 0;
		}
	}
	return false;
};

var population = function(tower) {
	var population = 0;
	for (var i=0; i<tower.floors.length; i++) {
		population += pop(tower, i);
	}
	return population;
};

//   /$$$$$$$
//  | $$__  $$
//  | $$  \ $$  /$$$$$$  /$$    /$$
//  | $$$$$$$/ /$$__  $$|  $$  /$$/
//  | $$__  $$| $$$$$$$$ \  $$/$$/
//  | $$  \ $$| $$_____/  \  $$$/
//  | $$  | $$|  $$$$$$$   \  $/
//  |__/  |__/ \_______/    \_/
//

// Revenue Model
var rev = function(tower, idx) {
	if (idx >= 0){
		switch(tower.floors[idx].type) {
		case 'Condo':
			if (tower.floors[idx].tenants.occupied) {
				return {'single':true, amount:100000};
			} else {
				return 0;
			}
		case 'Office':
			if (tower.floors[idx].tenants.occupied) {
				return {'quarter':true, amount:10000};
			} else {
				return 0;
			}
		case 'Hotel':
			if (tower.floors[idx].tenants.occupied) {
				switch(tower.floors[idx].tenants.qol){
				case 'Good':
					return {'daily':true, amount:3000};
				case 'Neutral':
					return {'daily':true, amount: 2000};
				case 'Bad':
					return {'daily':true, amount: 800};
				}
			}
			return {'daily':true, amount: 0};
		case 'Restaurant':
			if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
				tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
			switch(tower.floors[idx].tenants.qol){
			case 'Good':
				return {'daily':true, amount: 10000};
			case 'Neutral':
				return {'daily':true, amount: 4000};
			case 'Bad':
				return {'daily':true, amount: -2000};
			}
			return 0;
		case 'Shop':
			if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
				tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
			switch(tower.floors[idx].tenants.qol){
			case 'Good':
				return {'daily':true, amount: 20000};
			case 'Neutral':
				return {'daily':true, amount: 10000};
			case 'Bad':
				return {'daily':true, amount: -4000};
			}
			return 0;
		case 'Theatre':
			if (!tower.floors[idx].tenants || !tower.floors[idx].tenants.qol)
				tower.floors[idx].tenants = {'occupied':true, 'qol':'Neutral', 'qolComments': []};
			switch(tower.floors[idx].tenants.qol){
			case 'Good':
				return {'daily':true, amount: 40000};
			case 'Neutral':
				return {'daily':true, amount: 10000};
			case 'Bad':
				return {'daily':true, amount: -8000};
			}
			return 0;
		case 'Housekeeping':
			return {'quarter':true, amount: -10000};
		case 'Security':
		case 'Medical':
			return {'quarter':true, amount: -20000};
		}
	}
	return false;
};

//  /$$$$$$$$ /$$           /$$
// |__  $$__/|__/          | $$
//    | $$    /$$  /$$$$$$$| $$   /$$
//    | $$   | $$ /$$_____/| $$  /$$/
//    | $$   | $$| $$      | $$$$$$/
//    | $$   | $$| $$      | $$_  $$
//    | $$   | $$|  $$$$$$$| $$ \  $$
//    |__/   |__/ \_______/|__/  \__/

var tick = function(req, res, skip) {
	// tick eval goes here
	// - first do a QoL check on all the floors
	// - write the QoL output & comments to JSON
	// - based on QoL, move tenants in/out
	// - if its the end of the day/quarter assess rent/income
	// - either redirect to the index, or return JSON if it's an XHR
	fs.readFile('towers/'+req.params.towerid+'.json', 'utf8', function(err, data) {
		var tower = JSON.parse(data);
		// lets count all our floors for calcs in the next loop
		var fc = {
			Office: 1,
			Condo: 1,
			Restaurant: 1,
			Hotel: 1,
			Housekeeping: 1,
			Shop: 1,
			Security: 1,
			Theatre: 1
		};
		for (var i=0; i<tower.floors.length; i++) {
			fc[tower.floors[i].type]++;
		}
		// loop through the floors and do QoL calcs, move tenants in/out
		// based on QoL
		for (i=0; i<tower.floors.length; i++) {
			if (tower.floors[i].tenants){
				var qolScore = 0;
				var qolComments = [];
				switch(tower.floors[i].type) {
				case 'Condo':
					// needs enough offices
					if (fc.Condo / fc.Office > 1.5) {
						qolScore--;
						qolComments.push('There aren\'t enough jobs.');
					}
					if (fc.Condo / fc.Office < 0.5) {
						qolScore++;
						qolComments.push('Plenty of jobs!');
					}
					// needs no commercial within 1 floor
					var c = com(tower, i);
					if (c) {
						qolScore += c;
						qolComments.push('It\'s too noisy.');
					}
					// needs high enough res/com ratio
					if ((fc.Condo + fc.hotel) / (fc.Restaurant + fc.Shop + fc.Theatre) > 6) {
						qolScore--;
						qolComments.push('There\'s nothing to do!');
					}
					if ((fc.Restaurant + fc.Shop + fc.Theatre) > 3 && ((fc.Condo + fc.Hotel) / (fc.Restaurant + fc.Shop + fc.Theatre) < 3)) {
						qolScore++;
						qolComments.push('There\'s lots of activities!');
					}
					// needs high enough police ratio
					if (tower.floors.length / fc.Security > 50) {
						qolScore--;
						qolComments.push('It\'s not safe in this building.');
					}
					if (tower.floors.length > 50 && (tower.floors.length / fc.Security < 20)) {
						qolScore++;
						qolComments.push('I feel safe in my home.');
					}
					// needs high enough medical ratio
					if (tower.floors.length / fc.Medical > 100) {
						qolScore -= 3;
						qolComments.push('It takes too long to see a doctor.');
					}
					if (tower.floors.length > 100 && (tower.floors.length / fc.Medical < 40)) {
						qolScore++;
						qolComments.push('This building has excellent medical care.');
					}
					break;
				case 'Office':
					// needs enough condos
					if (fc.Office / fc.Condo > 1.5 && r75()) {
						qolScore--;
						qolComments.push('There aren\'t enough workers.');
					}
					if (fc.Office / fc.Condo < 0.5) {
						qolScore++;
						qolComments.push('Plenty of talent!');
					}
					// needs high enough restaurant ratio
					if (fc.Office / fc.Restaurant > 5 && r75()) {
						qolScore -= 3;
						qolComments.push ('There\s nowhere to eat lunch!');
					}
					if (fc.Office / fc.Restaurant < 3) {
						qolScore++;
						qolComments.push ('There\s plenty of food places around here.');
					}
					// needs high enough police ratio
					if (tower.floors.length / fc.Security > 50) {
						qolScore -= 3;
						qolComments.push('It\'s not safe in this building.');
					}
					if (tower.floors.length > 50 && (tower.floors.length / fc.Security < 20)) {
						qolScore++;
						qolComments.push('I feel safe here.');
					}
					break;
				case 'Hotel':
					// needs enough housekeeping
					if (fc.Hotel / fc.Housekeeping > 10 && r75()) {
						qolScore -= 3;
						qolComments.push('These rooms are filthy!');
					}
					if (fc.Hotel / fc.Housekeeping < 6) {
						qolScore ++;
						qolComments.push('Clean rooms!');
					}
					// needs no commercial within 1 floor
					c = com(tower, i);
					if (c) {
						qolScore += c;
						qolComments.push('It\'s too noisy.');
					}
					// needs enough commerical properties
					if ((fc.Restaurant + fc.Shop + fc.Theatre) > 3 && ((tower.floors.length / (fc.Restaurant + fc.Shop + fc.Theatre)) > 3) && r75()) {
						qolScore--;
						qolComments.push('There\'s not enough to do in this Tower.');
					}
					if ((tower.floors.length / (fc.Restaurant + fc.Shop + fc.Theatre)) < 2.5) {
						qolScore++;
						qolComments.push('Lots to do here!');
					}
					break;
				case 'Restaurant':
					// needs enough res/com/hotel
					if ((fc.Condo + fc.Hotel + fc.Office) / fc.Restaurant < 2 && r75()) {
						qolScore--;
						qolComments.push('Not enough patrons.');
					}
					if((fc.Condo + fc.Hotel + fc.Office) / fc.Restaurant > 6) {
						qolScore++;
						qolComments.push('Plenty of business!');
					}
					// needs high enough police ratio
					if (tower.floors.length / fc.Security > 50) {
						qolScore -= 3;
						qolComments.push('It\'s not safe in this building.');
					}
					if (tower.floors.length > 50 && (tower.floors.length / fc.Security < 20)) {
						qolScore++;
						qolComments.push('I feel safe here.');
					}
					break;
				case 'Shop':
					// needs enough res/com/hotel
					if ((fc.Condo + fc.Hotel + fc.Office) / fc.Shop < 8 && r75()) {
						qolScore--;
						qolComments.push('Not enough patrons.');
					}
					if((fc.Condo + fc.Hotel + fc.Office) / fc.Shop > 12) {
						qolScore++;
						qolComments.push('Plenty of business!');
					}
					// needs high enough police ratio
					if (tower.floors.length / fc.Security > 50) {
						qolScore -= 3;
						qolComments.push('It\'s not safe in this building.');
					}
					if (tower.floors.length > 50 && (tower.floors.length / fc.Security < 20)) {
						qolScore++;
						qolComments.push('I feel safe here.');
					}
					break;
				case 'Theatre':
					// needs minimum population
					// needs enough res/com/hotel
					if ((fc.Condo + fc.Hotel + fc.Office) / fc.Theatre < 8 || population(tower) < 1000) {
						qolScore--;
						qolComments.push('Not enough patrons.');
					}
					if((fc.Condo + fc.Hotel + fc.Office) / fc.Theatre > 12 && population(tower) >= 1000) {
						qolScore++;
						qolComments.push('Plenty of business!');
					}
					// needs high enough police ratio
					if (tower.floors.length / fc.Security > 50) {
						qolScore -= 3;
						qolComments.push('It\'s not safe in this building.');
					}
					if (tower.floors.length > 50 && (tower.floors.length / fc.Security < 20)) {
						qolScore++;
						qolComments.push('I feel safe here.');
					}
					break;
				}
				var qolString = 'Neutral';
				if (qolScore < 0)
					qolString = 'Bad';
				if (qolScore > 0)
					qolString = 'Good';
				tower.floors[i].tenants.qol = qolString;
				tower.floors[i].tenants.qolComments = qolComments;
			}
		}
		var revenue = 0;
		for (i=0; i<tower.floors.length; i++) {
			// calculate rents based on the updated tower
			if (!skip) {
				var inc = rev(tower, i);
				if (inc.daily && t_nighttime) {
					revenue += inc.amount;
				}
				if (inc.quarter && t_quarter) {
					revenue += inc.amount;
				}
			}
			// move people out if they're unhappy
			// condo, office - quarterly
			// hotel - daily
			if (tower.floors[i].tenants) {
				switch(tower.floors[i].type) {
				case 'Restaurant':
				case 'Shop':
				case 'Theatre':
					tower.floors[i].tenants.occupied = true;
					break;
				case 'Condo':
					switch (tower.floors[i].tenants.qol) {
					case 'Bad':
						if (tower.floors[i].tenants.occupied && t_quarter && r75()) {
							tower.floors[i].tenants.occupied = false;
							revenue -= 100000;
						}
						break;
					case 'Neutral':
						if (!tower.floors[i].tenants.occupied && t_quarter && r75()) {
							tower.floors[i].tenants.occupied = true;
							revenue += 100000;

						}
						break;
					case 'Good':
						if (!tower.floors[i].tenants.occupied && t_quarter) {
							tower.floors[i].tenants.occupied = true;
							revenue += 100000;
						}
						break;
					}
					break;
				case 'Office':
					switch (tower.floors[i].tenants.qol) {
					case 'Bad':
						if (tower.floors[i].tenants.occupied && t_quarter && r75()) {
							tower.floors[i].tenants.occupied = false;
						}
						break;
					case 'Neutral':
						if (!tower.floors[i].tenants.occupied && t_quarter && r75()) {
							tower.floors[i].tenants.occupied = true;
						}
						break;
					case 'Good':
						if (!tower.floors[i].tenants.occupied && t_quarter) {
							tower.floors[i].tenants.occupied = true;
						}
						break;
					}
					break;
				case 'Hotel':
					switch (tower.floors[i].tenants.qol) {
					case 'Bad':
						if (tower.floors[i].tenants.occupied && t_nighttime && r75()) {
							tower.floors[i].tenants.occupied = false;
						}
						break;
					case 'Neutral':
						if (t_nighttime) {
							if (r75()) {
								tower.floors[i].tenants.occupied = true;
							} else {
								tower.floors[i].tenants.occupied = false;
							}
						}
						break;
					case 'Good':
						if (!tower.floors[i].tenants.occupied && t_nighttime) {
							tower.floors[i].tenants.occupied = true;
						}
						break;
					}
					break;
				}
			}
		}
		tower.cash += revenue;
		if (!skip) {
			// move time forward
			tower.ticks += 1000*60*60*12;
		}
		// write the tower back to json
		fs.writeFile('towers/'+req.params.towerid+'.json', JSON.stringify(tower), 'utf8', function() {
			index(req, res);
		});
	});
};

//  /$$                                     /$$
// | $$                                    | $$
// | $$        /$$$$$$  /$$    /$$ /$$$$$$ | $$
// | $$       /$$__  $$|  $$  /$$//$$__  $$| $$
// | $$      | $$$$$$$$ \  $$/$$/| $$$$$$$$| $$
// | $$      | $$_____/  \  $$$/ | $$_____/| $$
// | $$$$$$$$|  $$$$$$$   \  $/  |  $$$$$$$| $$
// |________/ \_______/    \_/    \_______/|__/

var level = function(req, res) {
	fs.readFile('towers/'+req.params.towerid+'.json', 'utf8', function(err, data) {
		var tower = JSON.parse(data);
		var msg = '';
		if (req.query.f > tower.floors.length) {
			// floor doesn't exist - add floor
			if (tower.cash >= 500) {
				tower.cash = tower.cash - 500;
				tower.floors.push({});
				fs.writeFile('towers/'+req.params.towerid+'.json', JSON.stringify(tower), 'utf8', function() {
					index(req, res);
				});
			} else {
				// need an error state
				msg = 'You don\'t have enough cash to perform this action';
				index(req, res, {error: msg});
			}
		} else {
			var idx = req.query.f - 1;
			if (tower.floors[idx].type) {
				if (req.query.u == 'x') {
					// delete unit
					if (tower.floors[idx].type == 'Condo' && tower.floors[idx].tenants.occupied == true) {
						if (tower.cash > 80000) {
							tower.cash = tower.cash - 80000;
							tower.floors[idx] = {};
							fs.writeFile('towers/'+req.params.towerid+'.json', JSON.stringify(tower), 'utf8', function() {
								tick(req, res, true);
							});
						} else {
							//error state here when we dont have cash to delete
							msg = 'You don\'t have enough cash to perform this action';
							index(req, res, {error: msg});
						}
					} else {
						tower.floors[idx] = {};
						fs.writeFile('towers/'+req.params.towerid+'.json', JSON.stringify(tower), 'utf8', function() {
							tick(req, res, true);
						});
					}
				} else {
					//floor info
					var floor = tower.floors[idx];
					floor.level = req.query.f;
					floor.pop = pop(tower, idx);
					floor.rev = rev(tower, idx);
					floor.xhr = req.xhr;
					floor.tid = req.params.towerid;
					//cost - occupied condos must be bought back from owners
					floor.cost = tower.floors[idx].type == 'Condo' &&
							tower.floors[idx].tenants.occupied == true ?
							true :
							false;
					if (req.xhr) {
						// ajax request, return HTML blocks
						res.render('floor', floor, function(e,html) {
							res.json({
								width: '300px',
								html: html
							});
						});
					} else {
						// generate index
						res.render('floor', floor);
					}
				}
			} else {
				//empty floor
				if (req.query.u) {
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
					};
					if (tenants) {
						tower.floors[idx].tenants = {occupied: false};
					}
					if (tower.cash >= cost) {
						tower.cash = tower.cash - cost;
						fs.writeFile('towers/'+req.params.towerid+'.json', JSON.stringify(tower), 'utf8', function() {
							tick(req, res, true);
						});
					} else {
						// need an error state
						msg = 'You don\'t have enough cash to perform this action';
						index(req, res, {error: msg});
					}
				} else {
					// picker
					var pData = {
						floor: idx+1,
						xhr: req.xhr,
						tid: req.params.towerid
					};
					if (req.xhr) {
						// ajax request, return HTML blocks
						res.render('picker', pData, function(e,html) {
							res.json({
								width: '620px',
								html: html
							});
						});
					} else {
						// generate index
						res.render('picker', pData);
					}
				}
			}
		}
	});
};

//   /$$$$$$   /$$                 /$$     /$$
//  /$$__  $$ | $$                | $$    |__/
// | $$  \__//$$$$$$    /$$$$$$  /$$$$$$   /$$  /$$$$$$$
// |  $$$$$$|_  $$_/   |____  $$|_  $$_/  | $$ /$$_____/
//  \____  $$ | $$      /$$$$$$$  | $$    | $$| $$
//  /$$  \ $$ | $$ /$$ /$$__  $$  | $$ /$$| $$| $$
// |  $$$$$$/ |  $$$$/|  $$$$$$$  |  $$$$/| $$|  $$$$$$$
//  \______/   \___/   \_______/   \___/  |__/ \_______/

var index = function(req, res, error) {
	res.cookie('last_tower', req.params.towerid, { maxAge: 900000, httpOnly: false});
	if (error) {
		var rn = Math.ceil(Math.random() * 100);
		if (req.xhr) {
			res.status(402).send(error.error);
			return false;
		} else {
			res.render('error', {error: error.error, rn: rn, tid: req.params.towerid});
			return false;
		}
	}
	fs.readFile('towers/'+req.params.towerid+'.json', 'utf8', function(err, data) {
		var tower = JSON.parse(data);
		tower.floors = tower.floors.reverse();
		tower.height = tower.floors.length + 1;
		tower.population = population(tower);
		var tickDate = new Date(tower.ticks);
		tower.time = (tickDate.getHours() < 6 || tickDate.getHours() > 18) ? 'Nighttime' : 'Daytime';
		tower.backgroundPosition = (tickDate.getHours() < 6 || tickDate.getHours() > 18) ? '0vh' : '-550vh;';
		tower.backgroundPositionFb = (tickDate.getHours() < 6 || tickDate.getHours() > 18) ? '-100%' : '-600%;';
		tower.day = Math.floor((tickDate/8.64e7) % 90);
		tower.quarter = Math.floor((tickDate/8.64e7)/90) + 1;
		tower.year = Math.floor((tickDate/8.64e7)/360)  + 1;
		tower.dateString = tower.time + ', ' + 'D' + tower.day + '/Q' + tower.quarter + '/Y' + tower.year;
		tower.l = req.query.l ? req.query.l : tower.floors.length;
		tower.lp = req.query.l ? req.query.l : false;
		tower.rn = Math.ceil(Math.random() * 100);
		tower.tid = req.params.towerid;
		if (req.query.l)
			var l = req.query.l < 14 ? 14 : req.query.l;

		//tower floor calc
		var idx = l && tower.floors.length >= l ? l : tower.floors.length;
		var floor;

		tower.floor = function() {
			floor = idx;
			idx--;
			return floor;
		};

		tower.floorCopy = function() {
			return floor;
		};

		tower.floor_padded = function() {
			var str = '' + floor;
			var pad = '00';
			var floor_padded = pad.substring(0, pad.length - str.length) + str;
			return floor_padded;
		};

		if (tower.floors.length > 14 && !req.xhr) {
			var start = l ? (tower.floors.length - l) : 0;
			start = start < 0 ? 0 : start;
			start = l < 14 ? 0 : start;
			tower.staticFloors = tower.floors.slice(start, start+14);
		} else {
			tower.staticFloors = tower.floors;
		}

		tower.floorClass = function() {
			var ret = '';
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
		};

		tower.qolHtml = function() {
			if (this.tenants && this.tenants.qol) {
				switch (this.tenants.qol) {
				case 'Good':
					return '<span aria-label="happy" class="q h"><span aria-hidden="true"></span> :) </span>';
				case 'Bad':
					return '<span aria-label="sad" class="q s"><span aria-hidden="true"></span> :( </span>';
				case 'Neutral':
					return '<span aria-label="neutral" class="q n"><span aria-hidden="true"></span> :| </span>';
				}
			} else {
				return '<span class="sp" aria-hidden="true"> &nbsp;&nbsp; </span>';
			}
		};

		tower.typeHtml = function() {
			if (this.tenants && this.tenants.occupied === false) {
				return this.type;
			} else {
				switch (this.type) {
				case 'Restaurant':
				case 'Shop':
				case 'Theatre':
					return '<strong>'+this.type+'</strong>';
				case 'Security':
				case 'Medical':
				case 'Housekeeping':
					return '<i>'+this.type+'</i>';
				case 'Condo':
					return '<b>Condo</b>';
				case 'Hotel':
					return '<tt>Hotel</tt>';
				case 'Office':
					return '<code>Office</code>';
				default:
					return 'Empty Floor';
				}
			}
		};

		tower.floorPadding = function() {
			if (this.type) {
				var numSpaces = this.type.length ? 13 - this.type.length : 13;
				var paddingStr = '';
				for (var i=0; i<numSpaces; i++) {
					paddingStr += '&nbsp;';
				}
				return paddingStr;
			}
			return '&nbsp;&nbsp;';
		};

		tower.floorDown = function () {
			if (req.xhr)
				return false;
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
			var begPad = '';
			var endPad = '';
			for (var i=0; i<numSpaces; i++) {
				if (begPad.length > endPad.length) {
					endPad += '&nbsp;';
				} else {
					begPad += '&nbsp;';
				}
			}
			return {'beg':beg, 'end':end, 'begPad':begPad, 'endPad':endPad};
		};

		tower.floorUp = function () {
			var topFloor = parseInt(l && tower.floors.length >= l ? l : tower.floors.length);
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
			var begPad = '';
			var endPad = '';
			for (var i=0; i<numSpaces; i++) {
				if (begPad.length > endPad.length) {
					endPad += '&nbsp;';
				} else {
					begPad += '&nbsp;';
				}
			}
			return {'beg':beg, 'end':end, 'begPad':begPad, 'endPad':endPad};
		};

		tower.cashF = function() {
			return tower.cash.toLocaleString('en-US');
		};

		if (req.xhr) {
			// ajax request, return HTML blocks
			res.render('tower', tower, function(e,html) {
				res.json({
					pop: tower.population,
					time: tower.dateString,
					cash: tower.cashF(),
					tower: html
				});
			});
		} else {
			// generate index
			res.render('index', tower);
		}
	});
};
