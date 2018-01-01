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
}