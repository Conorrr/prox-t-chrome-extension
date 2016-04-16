# prox-t
---

### What is prox-t?

A simple chrome extension that allows users to watch twitch streams via a different regional twitch datacenter instead of the default one that twitch usually assigns them.

### Why would anybody want to do that?
Many people have problems maintaining a quick constant connection to their closest twitch data center due to their ISPs bad routing or throttling twitch traffic.

### How it works?
When a stream first starts a request is made to a central twitch server (usher) this server assigns the user a server in a data center close to the users geographical location.  This application works by proxying this single request though a server in a different location to the user. This means that twitch assigns the user a slot in a different data center. Generally the users ISP hasn't throttled traffic to this server.

### What location should I choose?
For the best results I recommend selecting a server close to you and move further away until it works.

### Will it work for me?
Unfortunately this is hard question to answer. Also the extension currently only solves a couple of very specific problems. If you only experience lag occasionally then it probably wont help you yet.

The quickest and most reliable way to tell if it helps is to give it a go.

If you want to get an idea of what quality you should be able to watch head over to [speedtest.net](http://speedtest.net) run do a speed test and match your speed against the table below.

Speed  | Quality
-------|--------
3.5Mb+ | Source*
1.5Mb  | High
750Kb  | Medium
550Kb  | Low
250Kb  | Mobile

The above limits are theoretical you will need to have a connection slightly quicker because connections are generally unstable. Also if you are doing anything else on the internet then you will require a higher speed. 

*The speed required for Source varies on the bitrate that the broadcaster is streaming at, most popular broadcasters use 3500Kb/s.

### I have the extension install and enabled but it still doesn't do anything
Try multiple streams, if that doesn't help the unfortunately the extension in it's current state probably can't help you.

There is lots of help out there for people who experience lag. You can try contacting twitch by filling out [this form](https://docs.google.com/forms/d/1Y9ATuT6eCafDWPz5PtJkIImv1TE9q4l6oz-DzRBFQSA/viewform?c=0&w=1) sometimes they can spot issues and put pressure on ISPs to sort them.

Sometimes the problem is a mixture of an unstable connection and the flash player that twitch use. A solution for this is to use [livestreamer](http://docs.livestreamer.io/#).

### What more is to come?
First I hope to polish off the current functionality, make it easier to use and add some more backend servers to allow users to connect to a wider range of twitch servers.

Next I want to add the ability for users to proxy the entire stream through a server not just the first request. This will probably turn out to be quite expensive as it will require me to proxy a lot of traffic.

I also want to add the ability to manually set the size of the buffer that twitch uses. I have an idea of how this will work but I need to try it out and see if it's technically possible. If it does it should help people who have unstable but quick connections.

### How to install it
The easiest way to install the extension is from the chrome web store -> [here](https://chrome.google.com/webstore/detail/prox-t-beta/jhdgklojhkoemojopiklbdlcdajcnadk)

**IF YOU AREN'T FAMILIAR WITH ES2015 AND CHROME EXTENSION DEVELOPMENT YOU PROBABLY DON'T WANT TO READ ANY FURTHER**

If you are going to republish this application as a chrome extension please modify `/app/manifest.json` to contain your own personal details.

---

### Build Instructions

Step 0
* Install nodejs + npm - [Download here](https://nodejs.org/en/download/)
* Install gulp - `npm install --global gulp`

Step 1
* Install project dependencies `npm i`
* run `gulp build`
* Navigate to `chrome://extensions/` in chrome
* Check the developer mode checkbox in the top right hand corner
* Select load unpacked extension and navigate to `dist` in the project directory

Contact
-------
prox-t is currently still in beta and I would really appreciate any feedback that you have. If you have any questions about the extension of the proxy servers or anything really feel free to drop me a message:
* on reddit [/u/conorrr](https://www.reddit.com/message/compose/?to=conorrr) or [/u/prox-t](https://www.reddit.com/message/compose/?to=prox-t)
* via email proxt AT restall.io

---

prox-t is in no way affiliated with Twitch Interactive, Inc.
