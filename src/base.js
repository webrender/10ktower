/*global t,l, tid, h*/
var ls = 100;

document.addEventListener('DOMContentLoaded', function() {

	if (!('remove' in Element.prototype)) {
		Element.prototype.remove = function() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		};
	}

	var fc = function() {
		var floors = document.querySelectorAll('.f');
		for (var i = 0; i < floors.length; i++) {
			if (i != floors.length - 1) {
				floors[i].onclick = function(event) {
					event.preventDefault();
					var xhr = new XMLHttpRequest();
					var url = this.querySelectorAll('a')[0].href;
					xhr.open('GET', url);
					xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
					xhr.onload = function() {
						if (xhr.status === 200) {
							var res = JSON.parse(xhr.responseText);
							var modal = document.createElement('div');
							modal.id = 'm';
							modal.style['width'] = res.width;
							modal.innerHTML = res.html;
							var modalbg = document.createElement('div');
							modalbg.id = 'mb';
							modalbg.onclick = function() {
								ssp(ls);
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
										ssp(ls);
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
	document.getElementById('nc').innerHTML = '<svg id="cl" viewBox="0 0 100 100"><circle id="cf" cx="50" cy="50" r="45"/><g><rect id="ch" x="46" y="29" width="8" height="20"/><rect id="cm" x="48.5" y="12.5" width="5" height="40"/></g></svg><ul onclick="sp(event)"><li>||</li><li>></li><li>>></li><li>>>></li></ul>';

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
		ls = s;
		ssp(ls);
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
	var cn = function(el, inc) {
		var current = parseInt(el.innerHTML.replace(/,/g,''));
		inc = (typeof inc == 'string' ? parseInt(inc.replace(/,/g,'')) : inc);
		// current = current amount, inc = amount to increment
		var iv = setInterval(function(){
			if (current == inc) {
				clearInterval(iv);
			} else if (current > inc) {
				current -= Math.pow(10,Math.floor(Math.log(current - inc) / Math.LN10 + 0.000000001));
			} else if (current < inc) {
				current += Math.pow(10,Math.floor(Math.log(inc - current) / Math.LN10 + 0.000000001));
			}
			el.innerHTML = current.toLocaleString('en-US');
		}, 30);
	};
	var gt = function(path) {
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
				document.getElementById('zc').parentElement.className = data.cash > 0 ? 'vp' : 'vn';
				h = data.height;
				document.body.className = data.stars;
				// Update tower
				document.getElementById('t').innerHTML = data.tower;
				if (l) {
					window.scrollTo(0, document.getElementById('f'+(l)).offsetTop);
					l = false; //eslint-disable-line no-native-reassign
				}
				fc();
			} else if (xhr.status === 402) {
				data = xhr.responseText;
				var ed = document.createElement('div');
				ed.id = 'e';
				ed.innerHTML = data;
				ed.style.top = document.getElementById('sb').offsetHeight + 'px';
				document.body.appendChild(ed);
				setTimeout(function() {
					ed.remove();
				}, 2000);

			}
		};
		xhr.send();
	};
	var ef = 1;
	var elevator = function() {
		var p = ef;
		if (ef == 1)
			ef = Math.floor(Math.random() * (h - 1) + 1);
		else
			ef = 1;
		var et = (ef - p > 0 ? ef - p : p - ef)*.25;
		var ep = (ef-1)*41 + 1;
		document.styleSheets[1].insertRule('.t:before {transition: bottom linear '+et+'s}',document.styleSheets[1].cssRules.length);
		setTimeout(function() {
			document.styleSheets[1].insertRule('.t:before {bottom: '+ep+'px}',document.styleSheets[1].cssRules.length);
		}, 100);
		setTimeout(elevator, (et+5)*1000);
	};
	elevator();

	var sk = document.createElement('div');
	sk.id = 'sk';
	for (var i=1; i < 5; i++){
		var c = document.createElement('div');
		var s = document.createElement('div');
		c.id = ('c'+i);
		s.id = ('s'+i);
		sk.appendChild(c);
		sk.appendChild(s);
	}
	document.body.appendChild(sk);

	gt('/');
	ssp(ls);
}, false);
