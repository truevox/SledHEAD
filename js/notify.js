/* notify.js - Enhanced Notification System for SledHEAD */

function ensureNotificationContainer() {
	const id = 'notification-container';
	let container = document.getElementById(id);
	if (!container) {
		container = document.createElement('div');
		container.id = id;
		document.body.appendChild(container);
	}
	return container;
}

const activeNotifications = new Set();

export function showStackedNotification(message, type = 'info', duration = 3000) {
	if (activeNotifications.has(message)) return;
	activeNotifications.add(message);

	const container = ensureNotificationContainer();
	const notification = document.createElement('div');

	notification.className = `notification ${type}-notification`;
	notification.innerHTML = `
		<span class="icon">${getIconForType(type)}</span>
		<span class="message">${message}</span>
		<button class="dismiss-btn" title="Dismiss">&times;</button>
	`;

	// Dismiss manually
	notification.querySelector('.dismiss-btn').addEventListener('click', () => {
		dismissNotification(notification, message);
	});

	container.appendChild(notification);

	setTimeout(() => {
		dismissNotification(notification, message);
	}, duration);
}

function dismissNotification(notification, message) {
	if (notification && notification.parentNode) {
		notification.classList.add('fade-out');
		setTimeout(() => {
			if (notification.parentNode) {
				notification.parentNode.removeChild(notification);
			}
			activeNotifications.delete(message);
		}, 300); // Match CSS fade-out duration
	}
}

function getIconForType(type) {
	switch (type) {
		case 'success': return '✅';
		case 'error': return '❌';
		case 'warning': return '⚠️';
		case 'info':
		default: return 'ℹ️';
	}
}

export function showCenteredNotification(message, colorRGBA = [255, 255, 0, 0.8], duration = 1500) {
	const notificationId = 'centered-notification';
	let notification = document.getElementById(notificationId);

	if (!notification) {
		notification = document.createElement('div');
		notification.id = notificationId;
		notification.className = 'centered-notification';
		document.body.appendChild(notification);
	}

	notification.style.backgroundColor = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, ${colorRGBA[3]})`;
	notification.textContent = message;
	notification.classList.remove('fade-out');
	notification.style.display = 'block';

	setTimeout(() => {
		notification.classList.add('fade-out');
		setTimeout(() => {
			notification.style.display = 'none';
		}, 300);
	}, duration);
}

export function showNotification(message, colorRGBA = [255, 255, 0, 0.8], duration = 1500) {
	showCenteredNotification(message, colorRGBA, duration);
}

// Add convenience functions for error and success notifications
export function showErrorNotification(message, duration = 3000) {
	showStackedNotification(message, 'error', duration);
}

export function showSuccessNotification(message, duration = 3000) {
	showStackedNotification(message, 'success', duration);
}

export function showWarningNotification(message, duration = 3000) {
	showStackedNotification(message, 'warning', duration);
}

export function showInfoNotification(message, duration = 3000) {
	showStackedNotification(message, 'info', duration);
}
