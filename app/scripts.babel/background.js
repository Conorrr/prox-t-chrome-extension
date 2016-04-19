'use strict';

let asTab = (() => {
  let requestPattern = 'http://usher\.ttvnw\.net/api/channel/hls/[a-zA-Z0-9_]{4,25}\.m3u8';

  let defaultServer = '';
  let port = 80;

  const enabledIconImage = 'images/Logo_38_active.png';
  const disabledIconImage = 'images/Logo_38.png';

  // {tabId:{enabled:t/f, server:'London'}, ...}
  let status = {};

  let servers = {
    'Amsterdam': 'ams.restall.io',
    'London': 'lon.restall.io',
    'Miami': 'mia.restall.io',
    'New York': 'nyc.restall.io',
    'San Jose': 'svy.restall.io',
    'Sydney': 'syd.restall.io',
    'Tokyo': 'tok.restall.io',
    'Washington': 'atl.restall.io',
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

  let getPair = function(str) {
    return str.split('=');
  }

  let buildUrl = function(server, steamerName, params) {
    return 'http://' + servers[server] + ':' + port + '/init/' + steamerName + '?' + buildParamString(params);
  }

  let buildParamString = function(params) {
    let out = [];
    for (let key in params) {
      out.push(key + '=' + params[key]);
    };
    return out.join('&');
  }

  let restartTwitchVideo = function(tabId) {
    // this is really hacky, once i get time i will replace this with a nicer way to restart videos
    let code = 'document.getElementsByClassName(\'player-button--playpause\')[0].click();setTimeout(function(){ document.getElementsByClassName(\'player-button--playpause\')[0].click(); }, 1000);';
    chrome.tabs.executeScript(tabId, {
      code: code
    });
  }

  let activateOnTwitchTabs = function() {
    chrome.tabs.query({
      url: 'https://www.twitch.tv/*'
    }, function(tabs) {
      tabs.forEach((tab) => chrome.pageAction.show(tab.id));
    });
  }

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
    if (tab.url.indexOf('https://www.twitch.tv/') == 0) {
      chrome.pageAction.show(tabId);
      if (status[tabId] !== undefined && status[tabId].enabled) {
        changeIcon(tabId, enabledIconImage);
      }
    }
  });

  chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == 'install') {
      showFirstRunPopup();
      activateOnTwitchTabs();
    } else if (details.reason == 'update') {
      showFirstRunPopup();
      activateOnTwitchTabs();
      var thisVersion = chrome.runtime.getManifest().version;
    }
  });

  // override the port number with something different if it's set
  chrome.storage.local.get('port', (portNum) => {
    port = portNum.port ? portNum.port : port;
  });

  let showFirstRunPopup = function() {
    let popupHeight = 700;
    let popUpWidth = 600;
    let windowLeft = Math.round((screen.width - popUpWidth) / 2);
    let windowTop = Math.round((screen.height - popupHeight) / 2);

    chrome.tabs.create({
      url: chrome.extension.getURL('firstRun.html'),
      active: false
    }, function(tab) {
      chrome.windows.create({
        tabId: tab.id,
        type: 'popup',
        focused: true,
        height: popupHeight,
        width: popUpWidth,
        top: windowTop,
        left: windowLeft
      });
    });
  }


  return asTab;
})();