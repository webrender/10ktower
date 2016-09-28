document.addEventListener('DOMContentLoaded', function() {
	var fc = function() {
		var floors = document.querySelectorAll('.f');
		for (var i = 0; i < floors.length; i++) {
			if (i != floors.length - 1) {
				floors[i].onclick = function(event) {
					event.preventDefault();
					window.location = this.querySelectorAll('a')[0].href;
				};
			}
		}
	};
	fc();
});
