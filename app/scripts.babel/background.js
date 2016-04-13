'use strict';

var requestPattern = 'http://usher\.ttvnw\.net/api/channel/hls/[a-zA-Z0-9_]{4,25}\.m3u8';

var enabled = false;
var servers = {
	'London': 'lon.restall.io:5050',
	'Miami': 'mia.restall.io:5050',
	'Silicon Valley': 'svy.restall.io:5050',
	'Sydney': 'syd.restall.io:5050',
	'localhost': 'localhost:5050'
};

var server = 'London';

var enable = function() {
	enabled = true;
	restartCurrentTwitchTab();
}

var disable = function() {
	enabled = false;
	restartCurrentTwitchTab();
}

var getStatus = function() {
	return enabled;
}

var getServers = function() {
	return servers;
}

var getCurrentServer = function() {
	return server;
}

var setServer = function(newServer) {
	server = newServer;

	if (enabled) {
		restartCurrentTwitchTab();
	}
}


// Private internals

var getPair = function(str) {
	return str.split('=');
}

var buildUrl = function(steamerName, params) {
	return 'http://' + servers[server] + '/init/' + steamerName + '?' + buildParamString(params);
}

var buildParamString = function(params) {
	var out = [];
	for (var key in params) {
		out.push(key + '=' + params[key]);
	};
	return out.join('&');
}

// redirect request
var callback = function(request) {
	if (!enabled) {
		return;
	}

	if (!request.url.match(requestPattern)) {
		return;
	}

	var parts = request.url.split('&');

	var nameAndToken = parts[0].substring(parts[0].lastIndexOf('/') + 1).split('?');
	var name = nameAndToken[0].slice(0, -5);
	var props = {
		'token': nameAndToken[1].substring(6)
	};

	// extract parts
	for (var i = 1; i < parts.length; i++) {
		var keyPair = getPair(parts[i]);
		props[keyPair[0]] = keyPair[1];
	}

	var blockingResponse = {
		'redirectUrl': buildUrl(name, props)
	};

	return blockingResponse;
}

var restartCurrentTwitchTab = function() {
	chrome.tabs.query({
		active: true
	}, function(tabs) {
		restartTwitchVideo(tabs[0].id);
	});
}

var restartTwitchVideo = function(tabId) {
	var code = 'document.getElementsByClassName(\'player-button--playpause\')[0].click();setTimeout(function(){ document.getElementsByClassName(\'player-button--playpause\')[0].click(); }, 1000);';
	chrome.tabs.executeScript(tabId, {
		code: code
	}, function() {});
}

var filter = {
	urls: ['http://usher.ttvnw.net/api/channel/hls/*']
};
var opt_extraInfoSpec = ['blocking'];

chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (tab.url.indexOf('https://www.twitch.tv/') == 0) {
		chrome.pageAction.show(tabId);
	}
});