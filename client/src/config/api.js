const configuredOrigin = String(import.meta.env.VITE_API_URL || '').trim();
const origin = configuredOrigin || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const API_ORIGIN = origin.replace(/\/$/, '');
export const API_BASE = `${API_ORIGIN}/api`;
