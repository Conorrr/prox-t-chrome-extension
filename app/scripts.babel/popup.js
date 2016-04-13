'use strict';

var bg = chrome.extension.getBackgroundPage();

var redraw = function() {
	document.getElementById('status').innerHTML = (bg.getStatus() ? 'enabled' : 'disabled');
	document.getElementById('enableButton').text = (bg.getStatus() ? 'disable' : 'enable');
}

var initialRender = function() {
	var serversSelect = document.getElementById('servers');
	var servers = bg.getServers();
	var currentServer = bg.getCurrentServer();
	serversSelect.appendChild(generateOption('Select a region', false));
	for (var key in servers) {
		var selected = key == currentServer;
		serversSelect.appendChild(generateOption(key, selected));
	}
}

var generateOption = function(name, selected) {
	var option = document.createElement('option');
	option.text = name;
	option.value = name;
	if (selected) {
		option.selected = 'selected';
	}
	return option;
}

var statusSelect = document.getElementById('servers');

statusSelect.addEventListener('change', function() {
	bg.setServer(statusSelect.value);
});

document.getElementById('enableButton').addEventListener('click', function() {
	if (bg.getStatus()) {
		bg.disable();
		redraw();
	} else {
		bg.enable();		
		redraw();
	}
});

initialRender();
redraw();