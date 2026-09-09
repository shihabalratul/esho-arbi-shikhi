// Username management for practice rooms

const STORAGE_KEY_USERNAME = 'esho_arabi_username';
const STORAGE_KEY_COLOR = 'esho_arabi_avatar_color';
const STORAGE_KEY_CLIENT_ID = 'esho_arabi_client_id';

export const AVATAR_COLORS = [
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Purple
  '#d97706', // Amber
  '#dc2626', // Rose
  '#0891b2', // Cyan
  '#db2777', // Pink
  '#4f46e5', // Indigo
];

export function getStoredUsername(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_USERNAME) || '';
}

export function saveStoredUsername(name: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USERNAME, name.trim());
}

export function getStoredAvatarColor(): string {
  if (typeof window === 'undefined') return AVATAR_COLORS[0];
  const saved = localStorage.getItem(STORAGE_KEY_COLOR);
  return saved || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export function saveStoredAvatarColor(color: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_COLOR, color);
}

export function getClientId(): string {
  if (typeof window === 'undefined') return 'client-guest';
  let id = localStorage.getItem(STORAGE_KEY_CLIENT_ID);
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY_CLIENT_ID, id);
  }
  return id;
}
