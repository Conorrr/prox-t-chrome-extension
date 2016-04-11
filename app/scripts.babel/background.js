'use strict';

var requestPattern = "http://usher\.ttvnw\.net/api/channel/hls/[a-zA-Z0-9_]{4,25}\.m3u8";

var enabled = false;
var servers = {
	"London": "lon.restall.io:5050",
	"Miami": "mia.restall.io:5050",
	"Sydney": "syd.restall.io:5050",
	"localhost": "localhost:5050"
};
var server = "london";


var enable = function() {
	enabled = true;
}

var disable = function() {
	enabled = false;
}

var getStatus = function() {
	return enabled;
}

var getServers = function() {
	return servers;
}

var setServer = function(newServer) {
	server = newServer;
}



// Private internals

var getPair = function(str) {
	return str.split("=");
}

var buildUrl = function(steamerName, params) {
	return "http://" + servers[server] + "/init/" + steamerName + ".m3u8?" + buildParamString(params);
}

var buildParamString = function(params) {
	var out = [];
	console.log(params);
	for (key in params) {
		out.push(key + "=" + params[key]);
	};
	return out.join("&");
}

// redirect request
var callback = function(request) {

	if (!enabled) {
		return;
	}

	if (!request.url.match(requestPattern)) {
		return;
	}
	var parts = request.url.split("&");

	var nameAndToken = parts[0].substring(parts[0].lastIndexOf("/") + 1, parts[0].length).split("?");
	var name = nameAndToken[0].slice(0, -5);
	var props = {
		"token": nameAndToken[1].substring(6)
	};

	// extract parts
	for (i = 1; i < parts.length; i++) {
		var keyPair = getPair(parts[i]);
		props[keyPair[0]] = keyPair[1];
	}

	var blockingResponse = {
		"redirectUrl": buildUrl(name, props)
	};

	return blockingResponse;

}

var filter = {
	urls: ["<all_urls>"]
};
var opt_extraInfoSpec = ["blocking"];

chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);