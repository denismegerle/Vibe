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