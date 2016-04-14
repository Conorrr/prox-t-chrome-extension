'use strict';

chrome.tabs.query({
	active: true,
	lastFocusedWindow: true
}, function(tabs) {
	// Do something with tabs
	var bg = chrome.extension.getBackgroundPage().asTab(tabs[0].id);

	var redraw = function() {
		document.getElementById('status').innerHTML = (bg.getStatus() ? 'enabled' : 'disabled');
		document.getElementById('enableButton').text = (bg.getStatus() ? 'disable' : 'enable');
	}

	var initialRender = function() {
		var serversSelect = document.getElementById('servers');
		var servers = bg.getServers();
		var currentServer = bg.getCurrentServer();
		serversSelect.appendChild(generateOption('', 'Select a region', false));
		for (var key in servers) {
			var selected = key == currentServer;
			serversSelect.appendChild(generateOption(key, key, selected));
		}
	}

	var generateOption = function(key, text, selected) {
		var option = document.createElement('option');
		option.value = key;
		option.text = text;
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
});