var ls=100;document.addEventListener("DOMContentLoaded",function(){"remove"in Element.prototype||(Element.prototype.remove=function(){this.parentNode&&this.parentNode.removeChild(this)});var a=function(){for(var a=document.querySelectorAll(".f"),b=0;b<a.length;b++)b!=a.length-1&&(a[b].onclick=function(a){a.preventDefault();var b=new XMLHttpRequest,c=this.querySelectorAll("a")[0].href;b.open("GET",c),b.setRequestHeader("X-Requested-With","XMLHttpRequest"),b.onload=function(){if(200===b.status){var a=JSON.parse(b.responseText),c=document.createElement("div");c.id="m",c.style.width=a.width,c.innerHTML=a.html;var d=document.createElement("div");d.id="mb",d.onclick=function(){f(ls),c.remove(),d.remove()},document.body.appendChild(c),document.body.appendChild(d),f(0);for(var e=c.querySelectorAll(".f"),g=0;g<e.length;g++)e[g].onclick=function(a){a.preventDefault();var b=this.getAttribute("f"),e=this.getAttribute("u");b&&e&&(h("/?f="+b+"&u="+e),f(ls),c.remove(),d.remove())}}},b.send()});document.getElementById("af").onclick=function(a){a.preventDefault();var b=document.createElement("a");b.href=document.getElementById("af").getElementsByTagName("a")[0].href,h("/"+b.search)}};a(),document.getElementById("nt").setAttribute("id","nc"),document.getElementById("nc").innerHTML='<svg id="cl" viewBox="0 0 100 100"><circle id="cf" cx="50" cy="50" r="45"/><g><rect id="ch" x="46" y="29" width="8" height="20"/><rect id="cm" x="48.5" y="12.5" width="5" height="40"/></g></svg><ul onclick="sp(event)"><li>||</li><li>></li><li>>></li><li>>>></li></ul>',window.sp=function(a){var b=100;switch(a.target.innerHTML){case"||":b=0;break;case"&gt;&gt;":b=30;break;case"&gt;&gt;&gt;":b=15}ls=b,f(ls)};var b=new Date(t),c={0:0,3:150,5:300,7:450,9:550,15:650,17:750,19:850,21:1e3},d=!1,e=null,f=function(a){e&&window.clearInterval(e),a&&(e=setInterval(function(){function a(a,b){a.setAttribute("transform","rotate("+b+" 50 50)")}if(b=new Date(b.getTime()+6e4),!d){for(var e=b.getHours();!c[e.toString()];)e=e>21?0:e+1;document.body.style.backgroundPosition="0 -"+c[e]+"vh",d=!0}0==b.getMinutes()&&(c[b.getHours()]!==!1&&(document.body.style.transition=0===b.getHours()?"none":"background-position 4s",document.body.style.backgroundPosition="0 -"+c[b.getHours()]+"vh"),6!=b.getHours()&&18!=b.getHours()||h("/?t=1")),a(document.getElementById("cm"),6*b.getMinutes()),a(document.getElementById("ch"),30*(b.getHours()%12)+b.getMinutes()/2)},a))},g=function(a,b){var c=parseInt(a.innerHTML.replace(/,/g,""));b="string"==typeof b?parseInt(b.replace(/,/g,"")):b;var d=setInterval(function(){c==b?clearInterval(d):c>b?c-=Math.pow(10,Math.floor(Math.log(c-b)/Math.LN10+1e-9)):c<b&&(c+=Math.pow(10,Math.floor(Math.log(b-c)/Math.LN10+1e-9))),a.innerHTML=c.toLocaleString("en-US")},30)},h=function(b){var c=new XMLHttpRequest;c.open("GET","/"+tid+b),c.setRequestHeader("X-Requested-With","XMLHttpRequest"),c.onload=function(){var b;if(200===c.status)b=JSON.parse(c.responseText),document.getElementById("zd").innerHTML=b.time,g(document.getElementById("zp"),b.pop),g(document.getElementById("zc"),b.cash),document.getElementById("t").innerHTML=b.tower,l&&(window.scrollTo(0,document.getElementById("f"+l).offsetTop),l=!1),a();else if(402===c.status){b=c.responseText;var d=document.createElement("div");d.id="e",d.innerHTML=b,d.style.top=document.getElementById("sb").offsetHeight+"px",document.body.appendChild(d),setTimeout(function(){d.remove()},2e3)}},c.send()};h("/"),f(ls)},!1);