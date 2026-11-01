import { create, isAxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBaseUrl = (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
    }
    return 'https://dgapp-vu9a.onrender.com/api';
};

const API_BASE_URL = getBaseUrl();
if (__DEV__) {
    console.log('[API] Initialized Base URL:', API_BASE_URL);
}

const api = create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically inject JWT token into requests if available
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('user_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // AsyncStorage read failure fallback
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Gracefully handle responses and suppress recurring 401 console spam
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const url = error?.config?.url;

        if (status === 401) {
            // Clean up stale credentials to prevent perpetual 401 loops
            try {
                await AsyncStorage.removeItem('user_token');
            } catch {
                // Ignore storage removal errors
            }
            return Promise.reject(error);
        }

        if (__DEV__ && status && status >= 500) {
            console.warn('[API Server Error]', url, status, error.response?.data);
        }
        return Promise.reject(error);
    }
);

export default api;

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (!isAxiosError(error)) return fallback;

    const detail: unknown = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
        const messages = detail
            .map((item: unknown) => {
                if (typeof item !== 'object' || item === null || !('msg' in item)) return null;
                return typeof item.msg === 'string' ? item.msg : null;
            })
            .filter((message): message is string => message !== null);
        if (messages.length) return messages.join('; ');
    }
    if (!error.response) {
        return 'Could not connect to the server. Check your internet connection and try again.';
    }

    return fallback;
}
