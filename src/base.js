/*global t,l*/
window.onload = function() {
	var fc = function() {
		var floors = document.querySelectorAll('.f');
		for (var i = 0; i < floors.length; i++) {
			floors[i].onclick = function(event) {
				event.preventDefault();
				console.log(this.querySelectorAll('a')[0].href);
				var xhr = new XMLHttpRequest();
				xhr.open('GET', this.querySelectorAll('a')[0].href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.onload = function() {
					if (xhr.status === 200) {
						console.log(xhr.responseText);
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
	var gt = function(path) {
		var mt = document.getElementById('af').getBoundingClientRect().top;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', path);
		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.onload = function() {
			if (xhr.status === 200) {
				var data = JSON.parse(xhr.responseText);
				document.getElementById('t').style.justifyContent = 'flex-start';
				document.getElementById('t').style.marginTop = (mt + document.body.scrollTop) + 'px';
				document.getElementById('t').innerHTML = data.tower;
				if (l) {
					window.scrollTo(0, document.getElementById('f'+(l+1)).offsetTop);
					l = false
				}
				fc();
			}
		};
		xhr.send();
	};

	gt('/');
	ssp(100);
};
