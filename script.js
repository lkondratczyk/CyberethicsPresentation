/*
 * drew's script
 */ 


window.onload = function() {
	var height = window.innerHeight;
	var width = window.innerWidth;
	
	var h = "";
	var w = "";
	var scrollPadFactor = -1;
	if (height < width) {
		h = Math.ceil((height * parseFloat(0.9)));
		w = Math.ceil((width * parseFloat(0.75)));
		scrollPadFactor = height*0.05;
	}
	else {
		h = Math.ceil((height * parseFloat(0.75)));
		w = Math.ceil((width * parseFloat(0.9)));
		scrollPadFactor = height*0.125;
	}

	var root = document.getElementById("drew");	
	root.style.height = h + "px";
	root.style.width = w + "px";

	var title = $("#title");
	var marginTop = height/2 - title.height()/2 - 84;
	setTimeout(function() {
		title.css("margin-top", marginTop);
	}, 500);
	
	var secs = document.getElementsByClassName("drewSN");
	var ptr = 0;
	
	function swipeRight() {
 		for (var i = 0; i < secs.length; i++) {
 			var s = secs[i];
 			var left = parseInt(s.style.left) - w;
 			s.style.left = left + "px";
 		}
 		
 		if (ptr == 4) {
 			document.getElementById("drewCntrl").style.opacity = "0.9";
 		}
 		else {
 			document.getElementById("drewCntrl").style.opacity = "0";
 		}
 			
 	} 			
	
	function swipeLeft() {
 		for (var i = 0; i < secs.length; i++) {
 			var s = secs[i];
 			var left = parseInt(s.style.left) + w;
 			s.style.left = left + "px";
 		}
 		
 		if (ptr == 4) {
 			document.getElementById("drewCntrl").style.opacity = "0.9";
 		}
 		else {
 			document.getElementById("drewCntrl").style.opacity = "0";
 		}
 			
 	}
 		
	document.getElementById("swipeRight").addEventListener("click", function() {
		if (ptr < secs.length - 1) { 
			ptr++;
			swipeRight();
		}
		else {
			this.style.backgroundColor = "red";
			setTimeout(function() {
				document.getElementById("swipeRight").style.backgroundColor = "white";
			}, 250);
		}
	});
	
	document.getElementById("swipeLeft").addEventListener("click", function() {
		if (ptr > 0) {
			ptr--;
			swipeLeft();
		}
		else {
			this.style.backgroundColor = "red";
			setTimeout(function() {
				document.getElementById("swipeLeft").style.backgroundColor = "white";
			}, 250);
		}
	});
	
	$(".scrollTo").click(function() {
		scrollTo($(this).val());
	});
	

	function scrollTo(name) {

		var top = $("#" + name).offset().top - scrollPadFactor;
		$("html, body").animate({
			scrollTop: top
		}, 1000);
	}
		
		
	function init()	{
		for (var i = 0; i < secs.length; i++) {
			secs[i].style.width = w + "px";
			secs[i].style.height = h + "px";
			secs[i].style.left = (i * w) + "px";
		}
	}
	
	init();
	
	
	// D3 code
		
	// http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png
	//
	var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token={token}', {
       			attribution: '<a href="http://www.mapbox.com/about/maps/" target="_blank">Terms &amp; Feedback</a>',
       			token: 'pk.eyJ1IjoiZHJld3N0aWxlcyIsImEiOiJjaWw2YXR4eXgwMWl6dWhsdjhrZGxuMXBqIn0.4rYaU8tPJ9Mw2bniPfAKdQ'
	});
	var map = L.map('map', {zoomControl:false})
		.addLayer(mapboxTiles)
		.setView([33.91439678750913, -118.245], 11);
		
	map.touchZoom.disable();
	map.doubleClickZoom.disable();
	map.scrollWheelZoom.disable();		
	
	var svg = d3.select(map.getPanes().overlayPane).append("svg");
	var g = svg.append("g").attr("class", "leaflet-zoom-hide");
	
	var ratios = [
		[0.02,0.04,0.07,0.11,0.16,0.21,0.27,0.34,0.42,0.51,0.61,0.72,0.84,0.96,1.00],
		[0.07,0.07,0.06,0.06,0.05,0.05,0.05,0.04,0.04,0.03,0.02,0.01,0.01,0.00,0.00]
	];
	var maxYear = 2026;
	var minYear = 2012;
	var currentYear = minYear;
	var numAuto = 0;
	var numAcc = 0;
	var autoIdx = 0;
	var accIdx = 1;
	var accidentResizeAnimationLength = 500;
	var numberOfAutonomousMarkers = 400;
	var points = d3.selectAll(".point")[0];
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
		
			
		var linePath = g.selectAll(".lineConnect")
				.data([features])
				.enter()
				.append("path")
				.attr("class", "lineConnect");
				
				
		function reset() {
				var bounds = d3path.bounds(data),
					topLeft = bounds[0],
					bottomRight = bounds[1];
				
			linePath.attr("d", toLine);
			for (var index = 0; index < numberOfAutonomousMarkers; index++) {
		
				var l = linePath.node().getTotalLength();
				var t = index / numberOfAutonomousMarkers;
				var p = linePath.node().getPointAtLength(t * l);
				
				
				g.append("circle")
							.attr("r", 0)
							.attr("fill", "red")
							.attr("class", "point")
							.style("opacity", "0.8")
							.attr("transform", "translate(" + p.x + "," + p.y + ")")
							.transition()
							.duration(accidentResizeAnimationLength)
							.attr("r", 4);	
			}	
			
			points = d3.selectAll(".point")[0];
			for (var i = 0; i < points.length; i++) {
				points[i].state = 0;
			}
					
				svg.attr("width", bottomRight[0] - topLeft[0] + 120)
					.attr("height", bottomRight[1] - topLeft[1] + 120)
					.style("left", topLeft[0] - 50 + "px")
					.style("top", topLeft[1] - 50 + "px");
			
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
		
		

		
		function drawYear(y) {
			// check min bound
			if (y == minYear) {
				document.getElementById("prevYear").disabled = true;
			}
			else {
				document.getElementById("prevYear").disabled = false;
			}
			
			// check max bound
			if (y == maxYear) {
				document.getElementById("nextYear").disabled = true;
			}
			else {
				document.getElementById("nextYear").disabled = false;
			}

			drawAcc();
			
			setTimeout(function() {
				drawAuto();
			}, accidentResizeAnimationLength);
				
			// update legend	
			document.getElementById("percentAcc").innerHTML = getRatio("acc").split("\.")[0] + "%";
			var autoRatio = "";
			var autoRatioFormat = getRatio("auto");
			var autoRatioWhole = autoRatioFormat.split("\.")[0];
			var autoRatioDec = autoRatioFormat.split("\.")[1];
			if (autoRatioWhole == 1) {
				autoRatio = "100%"
			}
			else {
 				 if (autoRatioDec.charAt(0) == "0") {
  				 	autoRatio = autoRatioDec.charAt(1) + "%";
  				}
 				else {
 					autoRatio = autoRatioDec + "%";
 				}	
			}
			
			document.getElementById("percentAuto").innerHTML = autoRatio;
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
		
		function setAuto() {
			for (var i = 0; i < points.length; i++) {
				var p = points[i];
				if (p.autonomous) {
					p.style.fill = "blue";
				}
				else {
					p.style.fill = "red";						
				}
			}
		}
		
		function drawAuto() {
		
			if (currentYear == maxYear) {
				for (var i = 0; i < points.length; i++) {
					points[i].autonomous = true;
				}
				numAuto = points.length;
			}
			else if (currentYear == minYear) {
				for (var i = 0; i < points.length; i++) {
					points[i].autonomous = false;
				}
				numAuto = 0;
			}
			else {
				var protect = 0;
				while (true) {
					if (protect++ > 1000) break;
					var i = Math.floor(Math.random() * points.length);
					var p = points[i];
					if (getRatio("auto") < ratios[autoIdx][currentYear - minYear]) {
						// increase from current state
						if (!p.autonomous) {
							p.autonomous = true;
							numAuto++;
						}
						else {
							continue;
						}
					}
					else if (getRatio("auto") > ratios[autoIdx][currentYear - minYear]) {
						// decrease from current state
						if (p.autonomous) {
							p.autonomous = false;
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
			
			setAuto();
		}
	
		function drawAcc() {
			d3.selectAll(".accident").transition().duration(accidentResizeAnimationLength).attr("r", 0);
			numAcc = parseFloat(ratios[accIdx][currentYear - minYear]) * 100;
			setTimeout(function() {
				var l = linePath.node().getTotalLength();
				g.selectAll(".accident").remove();
				for (var i = 1; i <= numAcc; i++) {
					var t = 0;
					if (i == numAcc) {
						t = Math.random();
					}
					else {
						t = i / numAcc;
					}
					var p = linePath.node().getPointAtLength(t * l);
				
					g.append("circle")
						.attr("r", 0)
						.attr("class", "accident")
						.style("opacity", "0.8")
						.attr("transform", "translate(" + p.x + "," + p.y + ")")
						.transition()
						.duration(accidentResizeAnimationLength)
						.attr("r", 20);
				}
			}, accidentResizeAnimationLength*2); // allow 2 prior animation frames
		}

		
		document.getElementById("nextYear").addEventListener("click", function() {
			drawYear(++currentYear);
		});
		
		document.getElementById("prevYear").addEventListener("click", function() {
			drawYear(--currentYear);
		});
		
		reset();
		drawYear(currentYear);
		
	}); // end d3.json function
		
};
