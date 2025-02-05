// Select DOM elements
const statusElement = document.getElementById("status");
const countdownContainer = document.getElementById("countdown-container");
const countdownElement = document.getElementById("time-remaining");
const intervalInput = document.getElementById("interval");
const messageContainer = document.getElementById("message-container");
const startStopButton = document.getElementById("start-stop");

// Function to update the status (Active/Inactive)
function updateStatus(isActive) {
	if (isActive) {
		statusElement.textContent = "Status: Active";
		statusElement.classList.remove("inactive");
		statusElement.classList.add("active");
		startStopButton.textContent = "Stop";  // Change button text
	} else {
		statusElement.textContent = "Status: Inactive";
		statusElement.classList.remove("active");
		statusElement.classList.add("inactive");
		startStopButton.textContent = "Start";  // Change button text
	}
}

// Function to update the countdown
function updateCountdown() {
	chrome.alarms.get("postureReminder", (alarm) => {
		if (alarm) {
			const now = new Date().getTime();
			const timeRemaining = alarm.scheduledTime - now;

			if (timeRemaining > 0) {
				const minutes = Math.floor(timeRemaining / 60000);
				const seconds = Math.floor((timeRemaining % 60000) / 1000);
				countdownElement.textContent = `${minutes}m ${seconds}s`;
			} else {
				countdownElement.textContent = "0m 0s";
			}
		} else {
			countdownElement.textContent = "N/A";
		}
	});
}

// Start the countdown update loop
function startCountdown() {
	setInterval(updateCountdown, 1000); // Update every second
}

// Load the initial alarm state and interval
chrome.alarms.get("postureReminder", (alarm) => {
	updateStatus(false); // Set status to inactive by default
	countdownContainer.style.display = "none"; // Hide countdown by default
});

// Load the interval from storage
chrome.storage.local.get("reminderInterval", (result) => {
	intervalInput.value = result.reminderInterval || 30;
});

// Save the interval
document.getElementById("save").addEventListener("click", () => {
	const interval = parseFloat(intervalInput.value);
	if (isNaN(interval) || interval <= 0) {
		alert("Please enter a valid number greater than 0.");
		return;
	}
	chrome.storage.local.set({ reminderInterval: interval }, () => {
		showMessage(`Interval set to ${interval} minutes.`, false);
	});
});

// Start/Stop reminders based on the current state
startStopButton.addEventListener("click", () => {
	if (statusElement.classList.contains("inactive")) {
		chrome.storage.local.get("reminderInterval", (result) => {
			const interval = result.reminderInterval || 30;
			chrome.alarms.create("postureReminder", { delayInMinutes: interval, periodInMinutes: interval });
			updateStatus(true);
			countdownContainer.style.display = "block"; // Show countdown
			startCountdown();
			showMessage(`Reminders started! You'll receive a notification every ${interval} minutes.`, false);
		});
	} else {
		chrome.alarms.clear("postureReminder", () => {
			updateStatus(false);
			countdownContainer.style.display = "none"; // Hide countdown
			showMessage("Reminders stopped!", false);
		});
	}
});

// Display a temporary message
function showMessage(message, isError = false) {
	const msgDiv = document.createElement("div");
	msgDiv.classList.add("message");
	if (isError) msgDiv.classList.add("error");
	msgDiv.textContent = message;
	messageContainer.appendChild(msgDiv);
	setTimeout(() => {
		msgDiv.classList.add("show");
	}, 10);
	setTimeout(() => {
		msgDiv.classList.remove("show");
		setTimeout(() => {
			messageContainer.removeChild(msgDiv);
		}, 500);
	}, 1200);
}
