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

var touchScroll = function( event ) {
    event.preventDefault();
};
var body = document.body,
overlay = document.querySelector('.overlay');

/* -----------INITIALIZE------------- */
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
});

function onWaypointButton() {
	var input = String(document.getElementById("waypointInput").value);
	
	// check if input are coordinates
	if (!representsCoordinates(input)) {
		alert("No coordinates in textfield...");
		return;
	}
		
	var coords = parseCoordinateText(input);
	nextWaypoint.str = input;
	nextWaypoint.latitude = coords.latitude;
	nextWaypoint.longitude = coords.longitude;
	
	document.getElementById("console-nextwpcoords").innerHTML = nextWaypoint.str;
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

// updates next wp except actual lat/long!
function updateNextWaypoint() {
	nextWaypoint.dist = airlineDistanceOf(deviceLocation.latitude, deviceLocation.longitude, nextWaypoint.latitude, nextWaypoint.longitude);
	nextWaypoint.dir = degreeBetween(deviceLocation.latitude, deviceLocation.longitude, nextWaypoint.latitude, nextWaypoint.longitude);
}

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
        		// update compass all the time...
        		var compassdir = event.alpha;
     		
        		document.getElementById("alphashow").innerHTML = Math.ceil(event.alpha);
        		var compassDisc = document.getElementById("compassdisc");
     	      	compassDisc.style.webkitTransform = "rotate("+ event.alpha +"deg)";
     	      	compassDisc.style.MozTransform = "rotate("+ event.alpha +"deg)";
     	      	compassDisc.style.transform = "rotate("+ event.alpha +"deg)";
        	}, true);
        	
        	// update variables in html
        	setInterval(function() {
        		document.getElementById("console-dest").innerHTML = nextWaypoint.str;
        		document.getElementById("console-nextwpcoords").innerHTML = nextWaypoint.str;
        		document.getElementById("console-nextwpdir").innerHTML = nextWaypoint.dir;
        		document.getElementById("console-nextwpdist").innerHTML = nextWaypoint.dist;
        		updateNextWaypoint();
        	}, 500);
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

function startCompass() {
	window.addEventListener("compassneedscalibration",function(event) {
	       event.preventDefault();
	}, true);
	window.addEventListener("deviceorientation",processEvent, true);
}

function stopCompass() {
	window.removeEventListener("deviceorientation",processEvent);
}

function getOrientation() {
	startCompass();
}

function watchOrientation() {
	alert("def");
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
}