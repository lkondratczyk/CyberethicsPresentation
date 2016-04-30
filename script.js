/*
 * drew's script
 */ 


window.onload = function() { 
	var height = window.innerHeight;
	var width = window.innerWidth;
	
	var root = document.getElementById("drew");
	var secs = document.getElementsByClassName("drewSN");
	var ptr = 0;
	
	var h = (height - 100);
	var w = (width * parseFloat(0.9));
	root.style.height = h + "px";
	root.style.width = w + "px";
	
	function next() {
		ptr = (ptr + 1) % secs.length;
		show(ptr);
	}
	
	function show(p) {
		for (var i = 0; i < secs.length; i++) {
			secs[i].style.width = w + "px";
			secs[i].style.height = h + "px";
			if (i == p) {
				secs[i].style.display = "block";
			}
			else {
				secs[i].style.display = "none";
			}
		}
	}
	
	document.getElementById("trolleyQs").setAttribute("height", h);
	document.getElementById("trolleyQs").setAttribute("width", w);
	document.getElementById("drewNxt").addEventListener("click", function() {
		next();
	});
	
	
	// init
	show(ptr);
		
};



