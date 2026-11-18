const STORAGE_KEY = "tcc-clinic-notifications-v1";
const MAX_NOTIFICATIONS = 30;
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load stored notifications:", e);
  }
  return [];
}
export function saveNotifications(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch (e) {
    console.warn("Failed to save notifications to storage:", e);
  }
}
export function addClinicNotification(item) {
  const now = Date.now();
  const newNotification = {
    id: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
    key: `notif-${now}-${Math.random().toString(36).slice(2, 7)}`,
    type: item.type,
    title: item.title,
    description: item.description,
    timestamp: now,
    date: new Date(now).toISOString(),
    category: item.category || "system",
    read: false
  };
  const current = getStoredNotifications();
  const updated = [newNotification, ...current].slice(0, MAX_NOTIFICATIONS);
  saveNotifications(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tcc-notifications-updated", {
      detail: updated
    }));
  }
  return newNotification;
}
export function clearAllClinicNotifications() {
  saveNotifications([]);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tcc-notifications-updated", {
      detail: []
    }));
  }
}
export function deleteClinicNotification(idOrKey) {
  const current = getStoredNotifications();
  const updated = current.filter(n => n.id !== idOrKey && n.key !== idOrKey);
  saveNotifications(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tcc-notifications-updated", {
      detail: updated
    }));
  }
}
const DISMISSED_ACTIVITIES_KEY = "tcc-dismissed-activities-v1";
export function getDismissedActivityKeys() {
  try {
    const raw = localStorage.getItem(DISMISSED_ACTIVITIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load dismissed activity keys:", e);
  }
  return [];
}
export function dismissActivity(key) {
  try {
    const current = getDismissedActivityKeys();
    if (!current.includes(key)) {
      const updated = [...current, key].slice(-200);
      localStorage.setItem(DISMISSED_ACTIVITIES_KEY, JSON.stringify(updated));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tcc-dismissed-activities-updated", {
          detail: updated
        }));
      }
    }
  } catch (e) {
    console.warn("Failed to dismiss activity:", e);
  }
}
export function dismissAllActivities(keys) {
  try {
    const current = getDismissedActivityKeys();
    const combined = Array.from(new Set([...current, ...keys])).slice(-200);
    localStorage.setItem(DISMISSED_ACTIVITIES_KEY, JSON.stringify(combined));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("tcc-dismissed-activities-updated", {
        detail: combined
      }));
    }
  } catch (e) {
    console.warn("Failed to dismiss all activities:", e);
  }
}
export function markAllNotificationsAsRead() {
  const current = getStoredNotifications();
  const updated = current.map(n => ({
    ...n,
    read: true
  }));
  saveNotifications(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tcc-notifications-updated", {
      detail: updated
    }));
  }
}