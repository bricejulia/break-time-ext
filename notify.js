
var validIdleTime = 60*10; // Amount of no activity to be eligible to be called a break
var timeToBreak = 60;

chrome.idle.setDetectionInterval(validIdleTime);

chrome.idle.onStateChanged.addListener(checkState);

var activityTime = 0; // Time for which user is active since last break

function getNotification() {
		var x = new XMLHttpRequest();
		x.open("GET", 'https://news.ycombinator.com/rss', true);
		x.onreadystatechange = function () {
			if (x.readyState == 4 && x.status == 200)
			{
				var doc = x.responseXML;
				var icns = 'hn.png';

				var items = doc.getElementsByTagName("item");
				var index = Math.floor((Math.random() * items.length) + 2);
				var item = items[index];

				var myNotificationID = null;
				var feedObj = {
					title: item.childNodes[0].innerHTML,
					link: item.childNodes[1].innerHTML
				};
				var notif = chrome.notifications.create(
					{
							type: 'basic',
							title: 'Time to take a break',
							iconUrl: icns,
							message: feedObj.title,
							buttons: [{title: "Open link"}]
					},
					function (id) {
						myNotificationID = id;
					}
				);

				chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
					if (notifId === myNotificationID) {
							if (btnIdx === 0) {
									window.open(feedObj.link);
									chrome.notifications.clear(myNotificationID);
							}
					}
			});
			}
		};
		x.send(null);

		var y = new XMLHttpRequest();
		y.open("GET", 'http://korben.info/feed', true);
		y.onreadystatechange = function () {
			if (y.readyState == 4 && y.status == 200)
			{

				var doc = document.createElement('div');
				doc.innerHTML = y.response;
				var icns = 'kb.png';

				var items = doc.getElementsByTagName("item");
				var index = Math.floor((Math.random() * items.length) + 2);
				var item = items[index];

				var myNotificationID = null;

				var feedObj = {
					title: item.childNodes[1].innerHTML,
					link: item.childNodes[3].nextSibling.data
				};

				var notif = chrome.notifications.create(
					{
							type: 'basic',
							title: 'Time to take a break',
							iconUrl: icns,
							message: feedObj.title,
							buttons: [{title: "Open link"}]
					},
					function (id) {
						myNotificationID = id;
					}
				);

				chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
					if (notifId === myNotificationID) {
							if (btnIdx === 0) {
									window.open(feedObj.link);
									chrome.notifications.clear(myNotificationID);
							}
					}
			});
			}
		};
		y.send(null);
}

function checkState (newState) {
	if (newState === 'idle' || newState === 'locked') {
		activityTime = 0;
	}
}

chrome.alarms.create("timeElapsedUpdate", {delayInMinutes: 0, periodInMinutes: 1});

chrome.alarms.onAlarm.addListener(updateTimeElapsed);

function updateTimeElapsed (alarm) {
	activityTime += 1;
	checkActivityTime();
}

function checkActivityTime() {
	if (activityTime >= timeToBreak) {
		getNotification();
		activityTime = 0;
	}
}
