// Listen for alarms and display a notification
chrome.alarms.onAlarm.addListener((alarm) => {
	if (alarm.name === "postureReminder") {
		chrome.notifications.create({
			type: "basic",
			iconUrl: "icon.png",
			title: "Posture Reminder",
			message: "It's time to stand up and stretch!",
			priority: 2, // High priority
			requireInteraction: true
		});
	}
});

// Remove the onStartup listener to prevent setting the alarm on startup
