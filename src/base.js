/*global t,l, tid*/
window.onload = function() {
	var fc = function() {
		var floors = document.querySelectorAll('.f');
		for (var i = 0; i < floors.length; i++) {
			floors[i].onclick = function(event) {
				event.preventDefault();
				var xhr = new XMLHttpRequest();
				xhr.open('GET', this.querySelectorAll('a')[0].href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.onload = function() {
					if (xhr.status === 200) {
						var modal = document.createElement('div');
						modal.id = 'm';
						modal.innerHTML = xhr.responseText;
						var modalbg = document.createElement('div');
						modalbg.id = 'mb';
						modalbg.onclick = function() {
							ssp(100);
							modal.remove();
							modalbg.remove();
						};
						document.body.appendChild(modal);
						document.body.appendChild(modalbg);
						ssp(0);
						var opts = modal.querySelectorAll('.f');
						for (var j = 0 ; j < opts.length; j++) {
							opts[j].onclick = function(e) {
								e.preventDefault();
								var f = this.getAttribute('f');
								var u = this.getAttribute('u');
								if (f && u) {
									gt('/?f='+f+'&u='+u);
									ssp(100);
									modal.remove();
									modalbg.remove();
								}
							};
						}
					}
				};
				xhr.send();
			};
		}
		document.getElementById('af').onclick = function(event) {
			event.preventDefault();
			var a = document.createElement('a');
			a.href = document.getElementById('af').getElementsByTagName('a')[0].href;
			gt('/'+a.search);
		};
	};
	fc();

	document.getElementById('nt').setAttribute('id','nc');
	document.getElementById('nc').innerHTML = '<svg id="cl" viewBox="0 0 100 100"><circle id="cf" cx="50" cy="50" r="45"/><g><rect id="ch" x="46" y="29" width="6" height="20"/><rect id="cm" x="48.5" y="12.5" width="3" height="40"/></g></svg><ul onclick="sp(event)"><li>||</li><li>></li><li>>></li><li>>>></li></ul>';

	window.sp = function(evt) {
		var s = 100;
		switch(evt.target.innerHTML) {
		case '||':
			s = 0;
			break;
		case '&gt;&gt;':
			s = 30;
			break;
		case '&gt;&gt;&gt;':
			s = 15;
			break;
		}
		ssp(s);
	};

	var d = new Date(t);
	var skyPositions = {
		'0':0,
		'3':150,
		'5':300,
		'7':450,
		'9':550,
		'15':650,
		'17':750,
		'19':850,
		'21':1000
	};
	var bg = false;
	var clk = null;
	var ssp = function(s) {
		if (clk)
			window.clearInterval(clk);
		if (s) {
			clk = setInterval(function() {
				d = new Date(d.getTime() + (60*1000));
				if (!bg) {
					var hour = d.getHours();
					while (!skyPositions[hour.toString()]) {
						hour = (hour > 21) ? 0 : hour + 1;
					}
					document.body.style['backgroundPosition'] = '0 -' + skyPositions[hour] + 'vh';
					bg = true;
				}
				if (d.getMinutes() == 0) {
					if (skyPositions[d.getHours()] !== false){
						document.body.style['transition'] = (d.getHours() === 0) ? 'none' : 'background-position 4s';
						document.body.style['backgroundPosition'] = '0 -' + skyPositions[d.getHours()] + 'vh';
					}
					if (d.getHours() == 6 || d.getHours() == 18) {
						gt('/?t=1');
					}
				}
				function r(el, deg) {
					el.setAttribute('transform', 'rotate('+ deg +' 50 50)');
				}
				r(document.getElementById('cm'), 6*d.getMinutes());
				r(document.getElementById('ch'), 30*(d.getHours()%12) + d.getMinutes()/2);
			}, s);
		}
	};
	var cn = function(el, int) {
		var current = parseInt(el.innerHTML.replace(/,/g,''));
		int = (typeof int == 'string' ? parseInt(int.replace(/,/g,'')) : int);
		var iv = setInterval(function(){
			if (current == int) {
				clearInterval(iv);
			} else if (current > int) {
				if (current - int > 1000)
					current -= 1000;
				else if (current - int > 100)
					current -= 100;
				else if (current - int > 10)
					current -= 10;
				else
					current--;
			} else if (current < int) {
				if (int - current > 1000)
					current += 1000;
				else if (int - current > 100)
					current += 100;
				else if (int - current > 10)
					current += 10;
				else
					current++;
			}
			el.innerHTML = current.toLocaleString('en-US');
		}, 30);
	};
	var gt = function(path) {
		var mt = document.getElementById('af').getBoundingClientRect().top;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', '/'+tid+path);
		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.onload = function() {
			var data;
			if (xhr.status === 200) {
				data = JSON.parse(xhr.responseText);
				// Update date
				document.getElementById('zd').innerHTML = data.time;
				// Update pop & cash
				cn(document.getElementById('zp'), data.pop);
				cn(document.getElementById('zc'), data.cash);
				// Update tower
				document.getElementById('t').style.justifyContent = 'flex-start';
				document.getElementById('t').style.marginTop = (mt + document.body.scrollTop) + 'px';
				document.getElementById('t').innerHTML = data.tower;
				if (l) {
					window.scrollTo(0, document.getElementById('f'+(l+1)).offsetTop);
					l = false; //eslint-disable-line no-native-reassign
				}
				fc();
			} else if (xhr.status === 402) {
				data = xhr.responseText;
				var ed = document.createElement('div');
				ed.id = 'e';
				ed.innerHTML = data;
				document.body.appendChild(ed);
				setTimeout(function() {
					ed.remove();
				}, 1000);

			}
		};
		xhr.send();
	};

	gt('/');
	ssp(100);

	var the_date = new Date();
	var unix_time = the_date.getTime();
	var expiration = unix_time + 2.592e6;
	the_date.setTime( expiration );
	document.cookie = 'last_tower='+tid+'; expires=' + the_date.toGMTString();

};
