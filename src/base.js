// var xhr = new XMLHttpRequest();
// xhr.open('GET', '/?t=1');
// xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
// xhr.onload = function() {
//     if (xhr.status === 200) {
//         console.log('success');
//     }
//     else {
//         console.log(xhr.status);
//     }
// };
// xhr.send();
window.onload = function() {
	var floors = document.querySelectorAll('.f');
	for (var i = 0; i < floors.length; i++) {
		floors[i].onclick = function() {
			window.location = this.querySelectorAll('a')[0].href;
			return false;
		};
	}

	document.getElementById('nt').setAttribute('id','nc');
	document.getElementById('nc').innerHTML = '<svg id="cl" viewBox="0 0 100 100"><circle id="cf" cx="50" cy="50" r="45"/><g><rect id="ch" x="46" y="29" width="6" height="20"/><rect id="cm" x="48.5" y="12.5" width="3" height="40"/></g></svg>';

	var d = new Date(0);
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
	setInterval(function() {
		d = new Date(d.getTime() + (60*1000));
		if (!bg) {
			var hour = d.getHours();
			while (!skyPositions[hour]) {
				hour++;
			}
			document.body.style['backgroundPosition'] = '0 -' + skyPositions[hour] + 'vh';
			bg = true;
		}
		if (d.getMinutes() == 0) {
			if (skyPositions[d.getHours()] !== false){
				document.body.style['transition'] = (d.getHours() === 0) ? 'none' : 'background-position 10s';
				document.body.style['backgroundPosition'] = '0 -' + skyPositions[d.getHours()] + 'vh';
			}
		}
		function r(el, deg) {
			el.setAttribute('transform', 'rotate('+ deg +' 50 50)');
		}
		r(document.getElementById('cm'), 6*d.getMinutes());
		r(document.getElementById('ch'), 30*(d.getHours()%12) + d.getMinutes()/2);
	}, 50);
};
