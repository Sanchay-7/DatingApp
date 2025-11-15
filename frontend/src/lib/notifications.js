/**
 * Browser Notification Service
 * Handles requesting permission and sending notifications for matches and messages
 */

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined") return false;
  
  // Check if the browser supports notifications
  if (!("Notification" in window)) {
    return false;
  }

  // If permission is already granted, return true
  if (Notification.permission === "granted") {
    return true;
  }

  // If permission is denied, don't request again
  if (Notification.permission === "denied") {
    return false;
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
};

export const sendNotification = (title, options = {}) => {
  if (typeof window === "undefined") return;

  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission !== "granted") {
    return;
  }

  try {
    new Notification(title, {
      badge: "/favicon.ico",
      tag: options.tag || "notification",
      requireInteraction: false,
      ...options,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

export const notifyNewMatch = (userName) => {
  sendNotification(`New Match! 💕`, {
    body: `${userName} liked you!`,
    tag: "new-match",
    icon: "/icons/heart.png",
  });
};

export const notifyNewMessage = (senderName, conversationId) => {
  sendNotification(`New Message from ${senderName} 💬`, {
    body: "You have a new message",
    tag: `message-${conversationId}`,
    icon: "/icons/message.png",
  });
};

export const isNotificationEnabled = () => {
  if (typeof window === "undefined") return false;
  const settings = localStorage.getItem("userSettings");
  if (!settings) return false;
  
  try {
    const parsed = JSON.parse(settings);
    return parsed.newMatchNotify === true;
  } catch {
    return false;
  }
};
