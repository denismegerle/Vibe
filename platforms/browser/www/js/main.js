/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var deviceLocation = {
	str: "N/A",
	latitude: "N/A",
	longitude: "N/A"
};

var nextWaypoint = {
	str: "N/A",
	latitude: "N/A",
	longitude: "N/A",
	dist: "N/A",
	dir: "N/A"
};

var orientationAbsolute = {
	alpha: "N/A",
	beta: "N/A",
	gamma: "N/A"
}

var gRouteLeg;

var curStep = 0;

var countSteps = false;

var map; // gmaps map
var marker; // gmaps marker

var bleList = [];
var bleDevice;

var touchScroll = function( event ) {
    event.preventDefault();
};
var body = document.body,
overlay = document.querySelector('.overlay');

$( document ).on( "pageinit", "#home-page", function() {
	$("#left-panel").panel().enhanceWithin();	// init global panel before start
	$("#overlay").hide();		// hide the overlay at start
	
	// open left panel by swiping
    $( document ).on( "swipeleft swiperight", "#home-page,#map-page,#conn-page,#comp-page", function( e ) {
        if ( $.mobile.activePage.jqmData( "panel" ) !== "open" ) {
            if ( e.type === "swiperight" ) {
                $( "#left-panel" ).panel( "open" );
            }
        }
    });
    
    // overlaying if panel is closed, no overlay if its open...
    $("#left-panel").on("panelbeforeopen",function(){
    	$("#overlay").show();
    });
    
    $("#left-panel").on("panelbeforeclose",function(){
        $("#overlay").hide();
    });
    
    $('#ble-devices-list').on('click', 'li', function () {
    	var clickedIndex = $(this).index();
    	handleBLConnect(clickedIndex);
    });
});

function initMap() {
    var uluru = {lat: -25.363, lng: 131.044};
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 6,
      center: uluru
    });
    marker = new google.maps.Marker({
      position: uluru,
      map: map
    });
  }

function onWaypointButton() {
	curStep = 0;
	countSteps = false;
	var input = String(document.getElementById("waypointInput").value);
	
	// check if input are coordinates
	if (!representsCoordinates(input)) {
		alert("No coordinates in textfield...");
		return;
	}
		
	var coords = parseCoordinateText(input);
	setNextWaypoint(coords);
}

function onRouteButton() {
	curStep = 0;
	countSteps = true;
	var request = createDirectionsRequest(deviceLocation);
	
	alert(request);
	
	$.getJSON(request, function(data) {
		gRouteLeg = data.routes[0].legs[0];
		
		var coords = new Object();
		coords.str = gRouteLeg.steps[0].html_instructions;
		coords.latitude = gRouteLeg.steps[0].end_location.lat;
		coords.longitude = gRouteLeg.steps[0].end_location.lng;
		
		setNextWaypoint(coords);
	});
}

function parseInputToRequest(input) {
	if (representsCoordinates(input))
		return input.replace(/ /g, '');
	return input.trim().replace(/ /g, '+');
}

function setNextWaypoint(coords) {
	if (coords.latitude === null || coords.longitude === null)
		return;
	nextWaypoint.str = coords.str;
	nextWaypoint.latitude = coords.latitude;
	nextWaypoint.longitude = coords.longitude;
	
	var gpos = { lat: nextWaypoint.latitude, lng: nextWaypoint.longitude };
	marker.setMap(null);
	marker = new google.maps.Marker({
		position: gpos,
	    map: map
	});
	map.setCenter(gpos);
}

// updates next wp except actual lat/long!
function updateNextWaypoint() {
	nextWaypoint.dist = airlineDistanceOf(deviceLocation.latitude, deviceLocation.longitude, nextWaypoint.latitude, nextWaypoint.longitude);
	nextWaypoint.dir = degreeBetween(deviceLocation.latitude, deviceLocation.longitude, nextWaypoint.latitude, nextWaypoint.longitude);
}

function getFacingDir(ev) {
	return ev.alpha;
}

function calcUserGoDirTo(facingDir, waypointDir) {
	
}

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', function() {
        	// update location all the time...
        	var locationWatchID = navigator.geolocation.watchPosition(function(position) {
        		deviceLocation.latitude = position.coords.latitude;
        		deviceLocation.longitude = position.coords.longitude;
        	}, function() {}, {enableHighAccuracy: true, frequency: 1 });
        	
        	// update device orientation constantly...
        	window.addEventListener("compassneedscalibration", function(event) {
     	       event.preventDefault();
        	}, true);
        	window.addEventListener("deviceorientationabsolute", function(event) {
        		// update compass orientation data all the time...
        		orientationAbsolute.alpha = event.alpha;
        		orientationAbsolute.beta = event.beta;
        		orientationAbsolute.gamma = event.gamma;
        	}, true);
        	
        	google.maps.event.addListener(map, "idle", function(){
                google.maps.event.trigger(map, 'resize'); 
            });
        	
        	// update variables in html
        	setInterval(function() {
        		document.getElementById("console-dest").innerHTML = nextWaypoint.str;
        		document.getElementById("console-nextwpcoords").innerHTML = nextWaypoint.latitude + "," + nextWaypoint.longitude;
        		document.getElementById("console-nextwpdir").innerHTML = nextWaypoint.dir;
        		document.getElementById("console-nextwpdist").innerHTML = nextWaypoint.dist;
        		updateNextWaypoint();
        		
        		if (countSteps) {
        			if (nextWaypoint.dist < 50.0) {
        				reachedNextWaypoint();
        			}
        		}
        	}, 100);
        	// update compass
        	setInterval(function() {
        		var compassdir = orientationAbsolute.alpha;
         		
        		document.getElementById("alphashow").innerHTML = Math.ceil(compassdir);
        		var compassDisc = document.getElementById("compassdisc");
     	      	compassDisc.style.webkitTransform = "rotate("+ compassdir +"deg)";
     	      	compassDisc.style.MozTransform = "rotate("+ compassdir +"deg)";
     	      	compassDisc.style.transform = "rotate("+ compassdir +"deg)";
     	      	
     	      	
     	      	var waypointDisc = document.getElementById("waypointsign-circle");
     	      	var correctionOffset = 45.0;
     	      	var userGoDir = correctionOffset + orientationAbsolute.alpha - nextWaypoint.dir;
     	      	waypointDisc.style.webkitTransform = "rotate("+ userGoDir +"deg)";
     	      	waypointDisc.style.MozTransform = "rotate("+ userGoDir +"deg)";
     	      	waypointDisc.style.transform = "rotate("+ userGoDir +"deg)";
        	}, 50);
        	// check if still connected with ble device
        	setInterval(function() {
        		ble.isConnected(bleDevice.id, function() {
        			// connected, send vibration signals
        			sendVibration();
        		}, function() {
        			// not connected, do nothing
        		})
        	}, 500);
        	// update home html
        	setInterval(function() {
        		document.getElementById("statusmsg-internet").innerHTML = internetStatus();
        		document.getElementById("statusmsg-bluetooth").innerHTML = bluetoothStatus();
        		document.getElementById("statusmsg-geo").innerHTML = geolocationStatus();
        		document.getElementById("statusmsg-map").innerHTML = gmapsStatus(map);
        		document.getElementById("statusmsg-connected").innerHTML = bleStatus(bleDevice);
        	}, 2000);
        }, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
    	app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function reachedNextWaypoint() {
	if (curStep + 1 < gRouteLeg.steps.length) {
		curStep++;
		var coords = new Object();
		coords.str = gRouteLeg.steps[curStep].html_instructions;
		coords.latitude = gRouteLeg.steps[curStep].end_location.lat;
		coords.longitude = gRouteLeg.steps[curStep].end_location.lng;
		setNextWaypoint(coords);
		
		// make green for a few secs or vibrate bluetooth device
	}
}

function scanButton() {
	$('#ble-scan-button').hide();
	scanBluetooth();
    setTimeout(function() {
        $('#ble-scan-button').show();
    }, 5000);
}

function scanBluetooth() {
	$('#ble-devices-list').empty();
	bleList = [];
	
	ble.isEnabled(function success() {
		ble.scan([], 5, function(device) {
			device.compatible = true;	// TODO TEST HERE!
			bleList.push(device);
			
			document.getElementById("ble-devices-list").appendChild(createBLListElement(device));
			// $('#ble-devices-list').append(li);
		}, false);
	}, function failure() {
		alert("Enable bluetooth!");
	});
}

function handleBLConnect(clickedIndex) {
	var select = $('#ble-devices-list').children()[clickedIndex];
	
	var conDevice = bleList[clickedIndex];
	
	ble.isConnected(conDevice.id, function success() {
		// already connected, then disconnect...
		ble.disconnect(conDevice.id, function success() {
			// revoking style changes
			select.removeChild(select.lastChild);
		}, function failure() {
			alert("Could not disconnect... Retry!");
		})
	}, function failure() {
		// not connected, then connect to the device if its compatible!
		ble.connect(conDevice.id, function success(device) {
			// now connected to device, style changes to node
			var connectedMessage = document.createElement("p");
			connectedMessage.appendChild(document.createTextNode("CONNECTED!"));

			select.appendChild(connectedMessage);
			// TODO -> CONNECT TO DEVICE !!!
			bleDevice = conDevice;
		}, function failure() {
			// connection failure
			alert("Could not connect to device!");
		})
	});
}

function watchOrientation() {
	
}

// sending vibration signals to bleDevice !
function sendVibration() {
	
}

function buttonClick() {
	// Test...
	alert("abc");
	/* ble.scan([], 10, foundBT, notFound) */
}

function foundBT(device) {
	alert(device.name)
}

function notFound() {
	alert("nothin found")
};

function toRad(value) {
    return value * Math.PI / 180;
}

function toDeg(value) {
	return value * 180 / Math.PI;
}

function airlineDistanceOf(lat1, long1, lat2, long2) {
	var R = 6371e3; // metres
	var φ1 = toRad(lat1);
	var φ2 = toRad(lat2);
	var Δφ = toRad(lat2 - lat1);
	var Δλ = toRad(long2 - long1);

	var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
	        Math.cos(φ1) * Math.cos(φ2) *
	        Math.sin(Δλ/2) * Math.sin(Δλ/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var d = R * c;
	
	return d;
}

function degreeBetween(lat1, long1, lat2, long2) {
	var φ1 = toRad(lat1);
	var φ2 = toRad(lat2);
	var Δφ = toRad(lat2 - lat1);
	var Δλ = toRad(long2 - long1);

    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1)
            * Math.cos(φ2) * Math.cos(Δλ);

    var brng = Math.atan2(y, x);

    brng = toDeg(brng);
    brng = (brng + 360) % 360;
    brng = 360 - brng; // count degrees counter-clockwise - remove to make clockwise
    return brng;
}

function representsCoordinates(input) {
	var regexCoords = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
	var regexMatch = input.match(regexCoords);
	
	if (regexMatch !== null)
		return true;
	return false;
}

function parseCoordinateText(input) {
	var strCoords = input.split(',');
	var coords = new Object();
	
	coords.str = input;
	coords.latitude = parseFloat(strCoords[0]);
	coords.longitude = parseFloat(strCoords[1]);
	
	return coords;
}

function createDirectionsRequest(deviceLocation) {
	var input = String(document.getElementById("waypointInput").value),
		gmapsUrl = "https://maps.googleapis.com/maps/api/directions/",
		outputFormat = "json?";
		origin = "origin=" + deviceLocation.latitude + "," + deviceLocation.longitude,
		destination = "destination=" + parseInputToRequest(input),
		apikey = "key=" + "AIzaSyBsgaNK6czEQ-n3O0jLIPdcoy_8qsNGUhI",
		parameters = origin + "&" + destination + "&" + apikey;
	
	return gmapsUrl + outputFormat + parameters;
};

function createBLListElement(device) {
	var li = document.createElement("li");
	
	var devName = document.createElement("h2");
	devName.appendChild(document.createTextNode(device.name));
	
	var devId = document.createElement("p");
	var devIdIn = document.createElement("strong");
	devIdIn.appendChild(document.createTextNode(device.id));
	devId.appendChild(devIdIn);
	
	var devCompatible = document.createElement("p");
	devCompatible.appendChild(document.createTextNode("compatible: " + device.compatible));
	
	var devRSSI = document.createElement("p");
	devRSSI.setAttribute('class', 'ui-li-aside');
	var devRSSIIn = document.createElement("strong");
	devRSSIIn.appendChild(document.createTextNode(device.rssi));
	devRSSI.appendChild(devRSSIIn);
	
	li.appendChild(devName);
	li.appendChild(devId);
	li.appendChild(devCompatible);
	li.appendChild(devRSSI);
	
	return li;
};

var stati = {
		internet: false,
		bluetooth: false,
		geolocation: false,
		gmaps: false,
		bleConnected: false
}

function updateStati(geoLocation, gmap, bleDevice) {
	stati.internet = internetStatus();
	stati.bluetooth = bluetoothStatus();
	stati.geolocation = geolocationStatus(geoLocation);
	stati.gmaps = gmapsStatus(gmap);
	stati.bleConnected = bleStatus(bleDevice);
}

function internetStatus() {
	stati.internet = navigator.onLine;
	return stati.internet;
}

function bluetoothStatus() {
	ble.isEnabled(function() {stati.bluetooth = true}, function() {stati.bluetooth = false});
	return stati.bluetooth;
}

function geolocationStatus() {
	if (!navigator) return false;
	if (!navigator.geolocation) return false;
	
	navigator.geolocation.getCurrentPosition(function(pos) {stati.geolocation = true}, function(err) {stati.geolocation = false}, {timeout: 1000, enableHighAccuracy:true});
	
	return stati.geolocation;
}

function gmapsStatus(gmap) {
	stati.gmaps = gmap ? true : false;
	return stati.gmaps;
}

function bleStatus(bleDevice) {
	ble.isConnected(bleDevice.id, function() {stati.bleConnected = true}, function() {stati.bleConnected = false});
	return stati.bleConnected;
}