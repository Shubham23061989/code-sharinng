// Central place for runtime config. All values come from Vite env vars (see .env.example).
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const MOCK_DELAY_MS = Number(import.meta.env.VITE_MOCK_DELAY_MS ?? 500);
