var xhr = new XMLHttpRequest();
xhr.open('GET', '/?t=1');
xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
xhr.onload = function() {
    if (xhr.status === 200) {
        console.log('success');
    }
    else {
        console.log(xhr.status);
    }
};
xhr.send();
window.onload = function() {
    var floors = document.querySelectorAll(".f");
    for (var i = 0; i < floors.length; i++) {
        floors[i].onclick = function() {
            window.location = this.querySelectorAll("a")[0].href;
            return false;
        };
    }
};
