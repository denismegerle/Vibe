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
}