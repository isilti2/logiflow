export type NotifType = 'success' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  time: string; // ISO
  read: boolean;
}

export async function addNotification(n: Omit<AppNotification, 'id' | 'time' | 'read'>): Promise<void> {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n),
    });
  } catch { /* ignore — non-critical */ }
}
