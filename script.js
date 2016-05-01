/*
 * drew's script
 */ 


window.onload = function() { 
	var height = window.innerHeight;
	var width = window.innerWidth;
	
	var root = document.getElementById("drew");
	var secs = document.getElementsByClassName("drewSN");
	var ptr = 3;
	
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
	
	var mapboxTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
       			attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
       			token: 'pk.eyJ1IjoiZHJld3N0aWxlcyIsImEiOiJjaWw2YXR4eXgwMWl6dWhsdjhrZGxuMXBqIn0.4rYaU8tPJ9Mw2bniPfAKdQ'
	});
	var map = L.map('map')
		.addLayer(mapboxTiles)
		.setView([33.90139678750913, -118.28928283691406], 11);
				
	var svg = d3.select(map.getPanes().overlayPane).append("svg");
	var g = svg.append("g").attr("class", "leaflet-zoom-hide");
	
	
	var ratios = [
		[0.1,0.1,0.1,0.1,0.1,0.1,0.4,0.4,0.4,0.4,0.4,0.4,0.7,0.9,1.0],
		[0.2,0.2,0.2,0.2,0.2,0.2,0.1,0.1,0.1,0.1,0.1,0.1,0.05,0.01,0.0]
	];
	var maxYear = 2027;
	var minYear = 2012;
	var currentYear = minYear;
	var numAuto = 0;
	var numAcc = 0;
	var autoIdx = 0;
	var accIdx = 1;
	d3.json("resources/roads.json", function(data) {
		var features = data.features;
		mapCoordinatesToView(features);
		
		var transform = d3.geo.transform({ point: projectPoint });
		var d3path = d3.geo.path().projection(transform);
		
		
// 		var colorScale = d3.scale.linear()
// 			.domain([0, NUM_YEARS])
// 			.range(["blue", "red"])
// 			.interpolate(d3.interpolateHcl);
			
			
		var toLine = d3.svg.line()
			.interpolate("linear")
			.x(function(d) {
				return applyLatLngToLayer(d).x
			})
			.y(function(d) {
				return applyLatLngToLayer(d).y
			});
		
		var ptFeatures = g.selectAll("circle")
			.data(features)
			.enter()
			.append("circle")
			.attr("r", 7)
			.attr("class", "point");
			
		var linePath = g.selectAll(".lineConnect")
				.data([features])
				.enter()
				.append("path")
				.attr("class", "lineConnect");
				
		map.on("viewreset", reset);	
		function reset() {
				var bounds = d3path.bounds(data),
					topLeft = bounds[0],
					bottomRight = bounds[1];
					
				ptFeatures.attr("transform",
					function(d) {
						return "translate(" + 
							applyLatLngToLayer(d).x + "," +
							applyLatLngToLayer(d).y + ")";
					});
					
				svg.attr("width", bottomRight[0] - topLeft[0] + 120)
					.attr("height", bottomRight[1] - topLeft[1] + 120)
					.style("left", topLeft[0] - 50 + "px")
					.style("top", topLeft[1] - 50 + "px");
				
				linePath.attr("d", toLine);
				g.attr("transform", "translate(" + (-topLeft[0] + 50) + ","
					+ (-topLeft[1] + 50) + ")");
		} // end reset function
								
		function applyLatLngToLayer(d) {
			var y = d.geometry.coordinates[1]
			var x = d.geometry.coordinates[0];
			return map.latLngToLayerPoint(new L.LatLng(y, x))
		}
	
		function mapCoordinatesToView(data) {
			for (var i = 0; i < data.length; i++) {
				var coordinates = applyLatLngToLayer(data[i]);
			
				data[i].properties.x = coordinates.x;
				data[i].properties.y = coordinates.y;
			}
		}
		
		function projectPoint(x, y)	{
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		}
		
		var points = d3.selectAll(".point")[0];
		for (var i = 0; i < points.length; i++) {
			points[i].state = 0;
		}
		
		function drawYear(y) {
			if (document.getElementById("auto").checked) {
				drawAuto();
			}
			if (document.getElementById("acc").checked) {
				setTimeout(function() { 
					drawAcc();
				}, 1000);
			}
				
			// update legend	
			document.getElementById("percentAuto").innerHTML = getRatio("auto").split("\.")[1];
			document.getElementById("percentAcc").innerHTML = getRatio("acc").split("\.")[1];
			document.getElementById("year").innerHTML = (currentYear); 
		} // end drawYear function
		
		function getRatio(about) {
			if (about == "auto") {
				return (parseFloat(numAuto) / points.length).toFixed(2);
			}
			else if (about == "acc") {
				return (parseFloat(numAcc)).toFixed(2)
			}
			else {
				console.error("about = " + about);
			}
		};
		
		function setAuto(yes, e) {
			if (yes) {
				e.autonomous = true;
				e.style.fill = "blue";
				e.style.opacity = 1;							
			}
			else {
				e.autonomous = false;
				e.style.fill = "red";
				e.style.opacity = 1;							
			}
		}
		
		function drawAuto() {
			var protect = 0;
			while (true) {
				if (protect++ > 1000) break;
				var i = Math.floor(Math.random() * points.length);
				var p = points[i];
				if (getRatio("auto") < ratios[autoIdx][currentYear - minYear]) {
					// increase from current state
					if (!p.autonomous) {
						setAuto(true, p);
						numAuto++;
					}
					else {
						continue;
					}
				}
				else if (getRatio("acc") > ratios[autoIdx][currentYear - minYear]) {
					// decrease from current state
					if (p.autonomous) {
						setAuto(false, p);
						numAuto--;
					}
					else {
						continue;
					}
				}
				else {
					break;
				}
			}
		}
		
		function drawAcc() {
			var numAcc = (Math.floor(parseFloat(ratios[accIdx][currentYear - minYear]) * 100));
			var l = linePath.node().getTotalLength();
			g.selectAll(".accident").remove();
			for (var i = 1; i <= numAcc; i++) {
				var t = i / numAcc;
				var p = linePath.node().getPointAtLength(t * l);
				
				g.append("circle")
					.attr("r", 15)
					.attr("class", "accident")
					.style("opacity", "0.7")
					.attr("transform", "translate(" + p.x + "," + p.y + ")");
			}
		}
		
		// initialize
		reset();
		for (var i = 0; i < points.length; i++) {
			setAuto(false, points[i]);
		};
		
		document.getElementById("nextYear").addEventListener("click", function() {
			drawYear(currentYear++);
		});
		
		document.getElementById("prevYear").addEventListener("click", function() {
			drawYear(currentYear--);
		});
		
	}); // end d3.json function
		
};
