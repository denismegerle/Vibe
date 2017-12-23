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
    
    initializeComp();
});

function initializeComp() {
	// initing compass listener
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
        document.addEventListener('deviceready', this.onDeviceReady, false);
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