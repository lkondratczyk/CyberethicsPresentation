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
	
	var animate;
	document.getElementById("drewVis").addEventListener("click", function() {
		animate();
	});
	
	
	// init
	show(ptr);
	// https://api.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token={token}
	var mapboxTiles = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
       			attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
       			token: 'pk.eyJ1IjoiZHJld3N0aWxlcyIsImEiOiJjaWw2YXR4eXgwMWl6dWhsdjhrZGxuMXBqIn0.4rYaU8tPJ9Mw2bniPfAKdQ'
	});
	
	var map = L.map('map')
	.addLayer(mapboxTiles)
	.setView([33.90139678750913, -118.28928283691406], 11);
				
	var svg = d3.select(map.getPanes().overlayPane).append("svg");
	var g = svg.append("g").attr("class", "leaflet-zoom-hide");
	
	var NUM_YEARS = 15;
	d3.json("resources/roads.json", function(data) {
		var features = data.features;
		mapCoordinatesToView(features);
		
		var transform = d3.geo.transform({ point: projectPoint });
		var d3path = d3.geo.path().projection(transform);
		
		
		var colorScale = d3.scale.linear()
			.domain([0, NUM_YEARS])
			.range(["blue", "red"])
			.interpolate(d3.interpolateHcl);
			
			
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
		
		reset();
		
		animate = function() {
			for (var i = 0; i < NUM_YEARS; i++) {
				drawYear(i);
			}
		};
		
		var points = d3.selectAll(".point")[0];
		for (var i = 0; i < points.length; i++) {
			points[i].state = 0;
		}
		
		var baseYear = 2012;
		var auto = 0;
		function drawYear(y) {
			setTimeout(function() {
				document.getElementById("year").innerHTML = (baseYear + y); 
				for (var i = 0; i < points.length; i++) {
					var p = points[i];
					if (y < 3) {
						if (Math.random() < 0.05 && p.state < 1) {
							p.style.fill = colorScale(y);
							p.style.opacity = 1;
							if (p.state == 0) auto++;
							p.state = 1;
						}
						else {
							// do nothing
						}
					} 
					else if (y < 6) {
						if (Math.random() < 0.1 && p.state < 2) {
							p.style.fill = colorScale(y);
							p.style.opacity = 1;
							if (p.state == 0) auto++;
							p.state = 2;
						}
						else {
							// do nothing
						}
					}
					else if (y < 9) {
						if (Math.random() < 0.1 && p.state < 3) {
							p.style.fill = colorScale(y);
							p.style.opacity = 1;
							if (p.state == 0) auto++;
							p.state = 3;
						}
						else {
							// do nothing
						}
					}
					else if (y < 14) {
						if (Math.random() < 0.4 && p.state < 4) {
							p.style.fill = colorScale(y);
							p.style.opacity = 1;
							if (p.state == 0) auto++;							
							p.state = 4;
						}
						else {
							// do nothing
						}
					}
					else {
						p.style.fill = colorScale(y);
						p.style.opacity = 1;
						if (p.state == 0) auto++;
						p.state = 4;
					}	
				}
				
				var form = ((parseFloat(auto) / points.length).toFixed(2) + " ").split("\.");
				var pct;
				if (form[0] == 1) {
					pct = form[0] + form[1];
				}
				else {
					pct = form[1];
				}
					
				document.getElementById("pen").innerHTML = pct;
			}, y * 1000);
		} // end drawYear function
		
	}); // end d3.json function
		
};
