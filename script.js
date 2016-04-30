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
	
	var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token={token}', {
       			attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
       			token: 'pk.eyJ1IjoiZHJld3N0aWxlcyIsImEiOiJjaWw2YXR4eXgwMWl6dWhsdjhrZGxuMXBqIn0.4rYaU8tPJ9Mw2bniPfAKdQ'
	});
	
	var map = L.map('map')
	.addLayer(mapboxTiles)
	.setView([34.00756196861457, -118.49982261657716], 15);
				
	var svg = d3.select(map.getPanes().overlayPane).append("svg");
	var g = svg.append("g").attr("class", "leaflet-zoom-hide");
	
	d3.json("resources/roads.json", function(data) {
		var features = data.features;
		mapCoordinatesToView(features);
		
		var transform = d3.geo.transform({ point: projectPoint });
		var d3path = d3.geo.path().projection(transform);
		
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
			.attr("r", 5)
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
		
	}); // end d3.json function
		
};
