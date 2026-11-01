import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { LanguageProvider } from '../context/LanguageContext';
import { View, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';
import OfflineNotice from '../components/OfflineNotice';

const SPLASH_DURATION = 1500; // Snappy, ultra-fast launch

function SplashScreen() {
    return (
        <View style={styles.splash}>
            {/* Cyber Glow Background Accents */}
            <View style={styles.glowOrbPrimary} />
            <View style={styles.glowOrbSecondary} />

            <View style={styles.splashCenter}>
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../../assets/DGLoGo.jpg')}
                        style={styles.splashLogo}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>NEXT GEN PLATFORM</Text>
                </View>
                <Text style={styles.splashBrand}>DG NOVA</Text>
                <Text style={styles.splashTagline}>Premium Retail Experience</Text>
                <Text style={styles.splashSubtext}>Quality Products • Trusted Delivery</Text>
            </View>

            <View style={styles.splashFooter}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.splashLoadingText}>Initializing your workspace...</Text>
            </View>
        </View>
    );
}

function RootLayoutNav() {
    const { token, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION);
        return () => clearTimeout(timer);
    }, []);

    // Auth guard (triggers strictly after splash timer and auth resolution)
    useEffect(() => {
        if (showSplash || isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!token && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (token && inAuthGroup) {
            router.replace('/(tabs)/tab1');
        }
    }, [token, isLoading, segments, showSplash]);

    if (showSplash) return <SplashScreen />;

    if (isLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <OfflineNotice />
            <Slot />
        </>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <LanguageProvider>
                <AuthProvider>
                    <CartProvider>
                        <RootLayoutNav />
                    </CartProvider>
                </AuthProvider>
            </LanguageProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    splash: {
        flex: 1,
        backgroundColor: Colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        position: 'relative',
    },
    glowOrbPrimary: {
        position: 'absolute',
        top: '20%',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(2, 132, 199, 0.18)',
    },
    glowOrbSecondary: {
        position: 'absolute',
        bottom: '22%',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
    },
    splashCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    logoWrapper: {
        width: 104,
        height: 104,
        borderRadius: 28,
        backgroundColor: Colors.card,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.45,
        shadowRadius: 20,
        elevation: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    splashLogo: {
        width: '100%',
        height: '100%',
    },
    brandBadge: {
        backgroundColor: 'rgba(2, 132, 199, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.35)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 10,
    },
    brandBadgeText: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
    },
    splashBrand: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 3,
        marginBottom: 8,
    },
    splashTagline: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.accent,
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    splashSubtext: {
        fontSize: 12,
        fontWeight: '500',
        color: Colors.textMuted,
        letterSpacing: 0.8,
    },
    splashFooter: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
        zIndex: 1,
    },
    splashLoadingText: {
        marginTop: 10,
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
});
