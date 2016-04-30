/*
 * drew's script
 */ 


window.onload = function() { 
	var height = window.innerHeight;
	var width = window.innerWidth;
	
	var root = document.getElementById("drew");
	var secs = document.getElementsByClassName("drewSN");
	var ptr = 0;
	
	root.style.height = (height - 100) + "px";
	root.style.width = (width * parseFloat(0.9)) + "px";
	
	function next() {
		ptr = (ptr + 1) % secs.length;
		show(ptr);
	}
	
	function show(p) {
		console.log("p is " + p);
		for (var i = 0; i < secs.length; i++) {
			if (i == p) {
				console.log("showing " + i);
				secs[i].style.display = "block";
			}
			else {
				secs[i].style.display = "none";
			}
		}
	}
	
	document.getElementById("drewNxt").addEventListener("click", function() {
		next();
	});
	
	
	// init
	show(ptr);
		
};



