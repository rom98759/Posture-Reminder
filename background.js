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

// Reset the alarm with a custom interval when the extension starts
chrome.runtime.onStartup.addListener(() => {
	chrome.storage.local.get("reminderInterval", (result) => {
		let interval = result.reminderInterval || 30; // Default to 30 minutes
		if (interval < 1) {
			interval = 1; // Minimum interval of 1 minute
		}
		chrome.alarms.create("postureReminder", { delayInMinutes: interval, periodInMinutes: interval });
	});
});
