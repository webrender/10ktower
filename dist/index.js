document.addEventListener("DOMContentLoaded",function(a){document.getElementById("nt").setAttribute("id","nc"),document.getElementById("nc").innerHTML='<svg id="cl" viewBox="0 0 100 100"><circle id="cf" cx="50" cy="50" r="45"/><g><rect id="ch" x="46" y="29" width="6" height="20"/><rect id="cm" x="48.5" y="12.5" width="3" height="40"/></g></svg><ul onclick="sp(event)"><li>||</li><li>></li><li>>></li><li>>>></li></ul>',window.sp=function(a){var b=100;switch(a.target.innerHTML){case"||":b=0;break;case"&gt;&gt;":b=30;break;case"&gt;&gt;&gt;":b=15}f(b)};var b=new Date(t),c={0:0,3:150,5:300,7:450,9:550,15:650,17:750,19:850,21:1e3},d=!1,e=null,f=function(a){e&&window.clearInterval(e),a&&(e=setInterval(function(){function a(a,b){a.setAttribute("transform","rotate("+b+" 50 50)")}if(b=new Date(b.getTime()+6e4),!d){for(var e=b.getHours();!c[e.toString()];)e=e>21?0:e+1;document.body.style.backgroundPosition="0 -"+c[e]+"vh",d=!0}0==b.getMinutes()&&(c[b.getHours()]!==!1&&(document.body.style.transition=0===b.getHours()?"none":"background-position 4s",document.body.style.backgroundPosition="0 -"+c[b.getHours()]+"vh"),6!=b.getHours()&&18!=b.getHours()||h("/?t=1")),a(document.getElementById("cm"),6*b.getMinutes()),a(document.getElementById("ch"),30*(b.getHours()%12)+b.getMinutes()/2)},a))},g=function(a,b){var c=parseInt(a.innerHTML.replace(/,/g,""));b="string"==typeof b?parseInt(b.replace(/,/g,"")):b;var d=setInterval(function(){c==b?clearInterval(d):c>b?c-b>1e4?c-=c-b-1111:c-b>1e3?c-=1e3:c-b>100?c-=100:c-b>10?c-=10:c--:c<b&&(b-c>1e4?c+=b-c-1111:b-c>1e3?c+=1e3:b-c>100?c+=100:b-c>10?c+=10:c++),a.innerHTML=c.toLocaleString("en-US")},30)},h=function(a){var b=new XMLHttpRequest;b.open("GET","/"+tid+a),b.setRequestHeader("X-Requested-With","XMLHttpRequest"),b.onload=function(){var a;if(200===b.status)a=JSON.parse(b.responseText),document.getElementById("zd").innerHTML=a.time,g(document.getElementById("zp"),a.pop),g(document.getElementById("zc"),a.cash),document.getElementById("t").innerHTML=a.tower,i(document.getElementById("t")),l&&(window.scrollTo(0,document.getElementById("f"+(l+1)).offsetTop),l=!1),fc();else if(402===b.status){a=b.responseText;var c=document.createElement("div");c.id="e",c.innerHTML=a,document.body.appendChild(c),setTimeout(function(){c.remove()},1e3)}},b.send()},i=function(a){var b=document.getElementById("af").getBoundingClientRect().top;window.innerHeight-101<a.clientHeight?(a.style.justifyContent="flex-start",a.style.marginTop=b+document.body.scrollTop+"px"):(a.style.justifyContent="flex-end",a.style.marginTop="100px")};h("/"),f(100)});