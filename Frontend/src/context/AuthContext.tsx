import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import {
    getStoredDeviceToken,
    saveDeviceToken,
    clearStoredDeviceToken,
    generateDeviceToken,
    promptDeviceAuthentication,
    cacheOfflineSession,
    getCachedOfflineSession,
    clearOfflineSession,
} from '../services/deviceAuthService';

export interface AuthUser {
    id: string;
    email: string;
    is_admin: boolean;
    role: 'admin' | 'user';
}

interface AuthContextType {
    token: string | null;
    user: AuthUser | null;
    deviceToken: string | null;
    isLoading: boolean;
    loginWithDevice: () => Promise<void>;
    registerWithDevice: (email: string) => Promise<void>;
    rebindDeviceWithLock: (email: string) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccountWithLock: () => Promise<void>;
    // Backward compatibility helpers
    login: (email?: string, pass?: string) => Promise<void>;
    register: (email?: string, pass?: string) => Promise<void>;
    deleteAccount: (email?: string, password?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [deviceToken, setDeviceToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const normalizeUser = (data: any): AuthUser => {
        const isAdmin = Boolean(data.is_admin || data.role === 'admin' || data.isAdmin);
        return {
            id: String(data.id || data.userId || ''),
            email: data.email || '',
            is_admin: isAdmin,
            role: isAdmin ? 'admin' : 'user',
        };
    };

    const logout = useCallback(async () => {
        await AsyncStorage.removeItem('user_token');
        await clearOfflineSession();
        setToken(null);
        setUser(null);
    }, []);

    const loadStoredAuth = useCallback(async () => {
        try {
            const storedDevToken = await getStoredDeviceToken();
            setDeviceToken(storedDevToken);

            const storedToken = await AsyncStorage.getItem('user_token');
            if (storedToken) {
                if (storedToken.startsWith('demo_jwt_token_')) {
                    await logout();
                    return;
                }

                try {
                    const res = await api.get('/users/me');
                    setToken(storedToken);
                    const normUser = normalizeUser(res.data);
                    setUser(normUser);
                    await cacheOfflineSession(storedToken, normUser);
                } catch (netErr: any) {
                    if (netErr?.response?.status === 401) {
                        await logout();
                    } else if (!netErr?.response) {
                        const cached = await getCachedOfflineSession();
                        if (cached && cached.token === storedToken) {
                            setToken(cached.token);
                            setUser(normalizeUser(cached.user));
                        }
                    } else {
                        await logout();
                    }
                }
            }
        } catch (e) {
            console.error('[AuthContext] Load stored auth error:', e);
            await logout();
        } finally {
            setIsLoading(false);
        }
    }, [logout]);

    useEffect(() => {
        void loadStoredAuth();
    }, [loadStoredAuth]);

    const loginWithDevice = async () => {
        const storedToken = await getStoredDeviceToken();
        if (!storedToken) {
            throw new Error('NO_DEVICE_TOKEN');
        }

        const authResult = await promptDeviceAuthentication('Confirm your phone lock to sign in');
        if (!authResult.success) {
            throw new Error(authResult.error || 'Phone lock authentication cancelled or failed.');
        }

        try {
            const res = await api.post('/auth/login', { device_token: storedToken });
            const accessToken = res.data.token || res.data.access_token;
            if (!accessToken) {
                throw new Error('Server did not return an access token.');
            }

            await AsyncStorage.setItem('user_token', accessToken);
            setToken(accessToken);

            let userData = res.data.user;
            if (!userData) {
                const userRes = await api.get('/users/me');
                userData = userRes.data;
            }

            const normUser = normalizeUser(userData);
            setUser(normUser);
            await cacheOfflineSession(accessToken, normUser);
            setDeviceToken(storedToken);
        } catch (error: any) {
            if (!error.response) {
                const cached = await getCachedOfflineSession();
                if (cached) {
                    setToken(cached.token);
                    setUser(normalizeUser(cached.user));
                    return;
                }
            }
            throw error;
        }
    };

    const registerWithDevice = async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            throw new Error('Please enter a valid email address.');
        }

        const authResult = await promptDeviceAuthentication('Confirm phone lock to create account');
        if (!authResult.success) {
            throw new Error(authResult.error || 'Phone lock authentication was cancelled.');
        }

        const newDeviceToken = generateDeviceToken();

        const res = await api.post('/auth/register', {
            email: cleanEmail,
            device_token: newDeviceToken,
            is_admin: false,
        });

        await saveDeviceToken(newDeviceToken);
        setDeviceToken(newDeviceToken);

        const accessToken = res.data.token || res.data.access_token;
        if (accessToken) {
            await AsyncStorage.setItem('user_token', accessToken);
            setToken(accessToken);

            let userData = res.data.user;
            if (!userData) {
                try {
                    const userRes = await api.get('/users/me');
                    userData = userRes.data;
                } catch {
                    userData = { email: cleanEmail, is_admin: false };
                }
            }

            const normUser = normalizeUser(userData);
            setUser(normUser);
            await cacheOfflineSession(accessToken, normUser);
        }
    };

    const rebindDeviceWithLock = async (email: string) => {
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) {
            throw new Error('Please enter your registered email address.');
        }

        const authResult = await promptDeviceAuthentication('Confirm phone lock to link this device');
        if (!authResult.success) {
            throw new Error(authResult.error || 'Phone lock authentication was cancelled.');
        }

        const newDeviceToken = generateDeviceToken();

        const res = await api.post('/auth/rebind-device', {
            email: cleanEmail,
            new_device_token: newDeviceToken,
        });

        await saveDeviceToken(newDeviceToken);
        setDeviceToken(newDeviceToken);

        const accessToken = res.data.token || res.data.access_token;
        if (accessToken) {
            await AsyncStorage.setItem('user_token', accessToken);
            setToken(accessToken);

            let userData = res.data.user;
            if (!userData) {
                const userRes = await api.get('/users/me');
                userData = userRes.data;
            }

            const normUser = normalizeUser(userData);
            setUser(normUser);
            await cacheOfflineSession(accessToken, normUser);
        }
    };

    const deleteAccountWithLock = async () => {
        if (!user) throw new Error('Not authenticated');

        const authResult = await promptDeviceAuthentication(
            'Confirm phone lock to permanently delete your account'
        );
        if (!authResult.success) {
            throw new Error(authResult.error || 'Phone lock confirmation required to delete account.');
        }

        try {
            await api.delete('/users/me');
        } catch {
            await api.delete(`/users/${user.id}`);
        }

        await clearStoredDeviceToken();
        await logout();
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                deviceToken,
                isLoading,
                loginWithDevice,
                registerWithDevice,
                rebindDeviceWithLock,
                logout,
                deleteAccountWithLock,
                login: loginWithDevice,
                register: (e?: string) => registerWithDevice(e || ''),
                deleteAccount: deleteAccountWithLock,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
