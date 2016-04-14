'use strict';


//once it's working change to let [getServers,asTab] = {...} // see IIFE
let asTab = (() => {
  let requestPattern = 'http://usher\.ttvnw\.net/api/channel/hls/[a-zA-Z0-9_]{4,25}\.m3u8';

  let defaultServer = '';

  const enabledIconImage = 'images/Logo_38_active.png';
  const disabledIconImage = 'images/Logo_38.png';

  // {tabId:{enabled:t/f, server:'London'}, ...}
  let status = {};

  let servers = {
    'London': 'lon.restall.io:5050',
    'Miami': 'mia.restall.io:5050',
    'San Jose': 'svy.restall.io:5050',
    'Sydney': 'syd.restall.io:5050',
    'localhost': 'localhost:5050'
  };

  let methods = function(tabId) {
    return {
      enable: () => {
        if (status[tabId].server != '') {
          status[tabId].enabled = true;
          restartTwitchVideo(tabId);
          changeIcon(tabId, enabledIconImage);
        }
      },

      disable: () => {
        status[tabId].enabled = false;
        restartTwitchVideo(tabId);
        changeIcon(tabId, disabledIconImage);
      },

      getStatus: () => {
        return status[tabId].enabled;
      },

      getCurrentServer: () => {
        return status[tabId].server;
      },

      setServer: (newServer) => {
        status[tabId].server = newServer;
        if (status[tabId].enabled && newServer != '') {
          restartTwitchVideo(tabId);
        }
      },
      closeTab: () => {

      },
      getServers: () => {
        // immutable.of()
        return servers;
      }
    }
  };

  let changeIcon = function(tabId, image) {
    chrome.pageAction.setIcon({
      path: image,
      tabId: tabId
    });
  }

  let asTab = (tabId) => {
    if (!status[tabId]) {
      status[tabId] = {
        enabled: false,
        server: defaultServer
      };
    }

    return methods(tabId);
  }

  // Private internals

  let getPair = function(str) {
    return str.split('=');
  }

  let buildUrl = function(server, steamerName, params) {
    return 'http://' + servers[server] + '/init/' + steamerName + '?' + buildParamString(params);
  }

  let buildParamString = function(params) {
    let out = [];
    for (let key in params) {
      out.push(key + '=' + params[key]);
    };
    return out.join('&');
  }


  let restartCurrentTwitchTab = function() {
    chrome.tabs.query({
      active: true
    }, function(tabs) {
      // problem with mutliple windows -> if there are multiple windows there are multiple active tabs
      restartTwitchVideo(tabs[0].id);
    });
  }

  let restartTwitchVideo = function(tabId) {
    // this is really hacky, once i get time i will replace this with a nicer way to restart videos
    let code = 'document.getElementsByClassName(\'player-button--playpause\')[0].click();setTimeout(function(){ document.getElementsByClassName(\'player-button--playpause\')[0].click(); }, 1000);';
    chrome.tabs.executeScript(tabId, {
      code: code
    });
  }


  // redirect request
  let callback = function(request) {
    let tabId = request.tabId;

    if (status[tabId] === undefined || !status[tabId].enabled) {
      return;
    }

    if (!request.url.match(requestPattern)) {
      return;
    }

    let parts = request.url.split('&');

    let nameAndToken = parts[0].substring(parts[0].lastIndexOf('/') + 1).split('?');
    let name = nameAndToken[0].slice(0, -5);
    let props = {
      'token': nameAndToken[1].substring(6)
    };

    // extract parts
    for (let i = 1; i < parts.length; i++) {
      let keyPair = getPair(parts[i]);
      props[keyPair[0]] = keyPair[1];
    }

    let server = status[tabId].server;

    let blockingResponse = {
      'redirectUrl': buildUrl(server, name, props)
    };

    return blockingResponse;
  }

  let filter = {
    urls: ['http://usher.ttvnw.net/api/channel/hls/*']
  };

  let opt_extraInfoSpec = ['blocking'];

  chrome.webRequest.onBeforeRequest.addListener(callback, filter, opt_extraInfoSpec);

  chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url.indexOf('https://www.twitch.tv/') == 0 && changeInfo.status == 'complete') {
      chrome.pageAction.show(tabId);
    }
  });

  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'install') {
      activateOnTwitchTabs();
    } else if (details.reason == 'update') {
      activateOnTwitchTabs();
      var thisVersion = chrome.runtime.getManifest().version;
    }
  });

  let activateOnTwitchTabs = function() {
    chrome.tabs.query({
      url: 'https://www.twitch.tv/*'
    }, function(tabs) {
      tabs.forEach((tab) => chrome.pageAction.show(tab.id));
    });
  }

  return asTab;
})();