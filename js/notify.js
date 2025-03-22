/* notify.js */
// Generic notification framework for SledHEAD

// Base function to show notifications
function showNotification(message, colorRGBA = [255, 255, 0, 0.8], duration = 1000) {
  // Generate a unique ID based on the message
  const notificationId = 'notification-' + message.replace(/\s+/g, '-').toLowerCase();
  
  // Create or get the notification element
  let notification = document.getElementById(notificationId);
  if (!notification) {
    notification = document.createElement('div');
    notification.id = notificationId;
    notification.style.position = 'fixed';
    notification.style.top = '50%';
    notification.style.left = '50%';
    notification.style.transform = 'translate(-50%, -50%)';
    notification.style.backgroundColor = `rgba(${colorRGBA[0]}, ${colorRGBA[1]}, ${colorRGBA[2]}, ${colorRGBA[3]})`;
    notification.style.color = 'white';
    notification.style.padding = '20px';
    notification.style.borderRadius = '10px';
    notification.style.fontWeight = 'bold';
    notification.style.fontSize = '24px';
    notification.style.textAlign = 'center';
    notification.style.zIndex = '1000';
    notification.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.7)';
    document.body.appendChild(notification);
  }
  
  // Set content and make visible
  notification.textContent = message;
  notification.style.display = 'block';
  
  // Fade out after specified duration
  setTimeout(() => {
    notification.style.transition = 'opacity 0.5s';
    notification.style.opacity = '0';
    setTimeout(() => {
      notification.style.display = 'none';
      notification.style.opacity = '1';
      notification.style.transition = '';
    }, 500);
  }, duration);
}

// Specific notification types with predefined colors
function showErrorNotification(message, duration = 1000) {
  // Red background for errors
  showNotification(message, [255, 0, 0, 0.8], duration);
  // Play an error sound if available
  if (typeof playTone === 'function') {
    playTone(200, "square", 0.3, 0.4);
  }
}

function showSuccessNotification(message, duration = 1000) {
  // Green background for success
  showNotification(message, [0, 128, 0, 0.8], duration);
  // Play a positive sound if available
  if (typeof playTone === 'function') {
    playTone(600, "sine", 0.3, 0.4);
  }
}

function showWarningNotification(message, duration = 1000) {
  // Yellow background for warnings
  showNotification(message, [255, 255, 0, 0.8], duration);
  // Play a warning sound if available
  if (typeof playTone === 'function') {
    playTone(400, "triangle", 0.3, 0.4);
  }
}

function showInfoNotification(message, duration = 1000) {
  // Blue background for info
  showNotification(message, [0, 0, 255, 0.8], duration);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showNotification,
    showErrorNotification,
    showSuccessNotification,
    showWarningNotification,
    showInfoNotification
  };
}