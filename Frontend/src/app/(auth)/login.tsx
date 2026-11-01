import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useDeviceAuth } from '../../hooks/useDeviceAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { getApiErrorMessage } from '../../services/api';
const AUTH_COLORS = {
    background: '#F3F4F6',
    primary: '#24324A',
    accent: '#C76B4A',
    accentLight: '#FCEFE9',
    border: '#E4E7EC',
};

export default function LoginScreen() {
    const router = useRouter();
    const { loginWithDevice, rebindDeviceWithLock, loginAsDemo } = useAuth();
    const { security } = useDeviceAuth();

    const [isRebindMode, setIsRebindMode] = useState(false);
    const [rebindEmail, setRebindEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // Fast 1-tap demo mode bypass
    const handleDemoEnter = async (role: 'user' | 'admin') => {
        try {
            setLoading(true);
            await loginAsDemo(role);
            router.replace('/(tabs)/tab1');
        } finally {
            setLoading(false);
        }
    };

    // Primary action: Authenticate with current active phone lock (Biometrics / PIN / Pattern)
    const handleDeviceUnlock = useCallback(async () => {
        try {
            setLoading(true);
            await loginWithDevice();
            router.replace('/(tabs)/tab1');
        } catch (error: any) {
            if (error?.message === 'NO_DEVICE_TOKEN') {
                setIsRebindMode(true);
                Alert.alert(
                    'No Linked Account',
                    'This device is not linked to an account yet. Register a new account or link an existing one.'
                );
            } else {
                Alert.alert(
                    'Authentication',
                    getApiErrorMessage(error, error?.message || 'Device authentication could not be completed.')
                );
            }
        } finally {
            setLoading(false);
        }
    }, [loginWithDevice, router]);

    // Handle account rebind for new phone or cleared cache
    const handleRebind = async () => {
        const cleanEmail = rebindEmail.trim();
        if (!cleanEmail) {
            return Alert.alert('Email Required', 'Please enter your registered account email.');
        }

        try {
            setLoading(true);
            await rebindDeviceWithLock(cleanEmail);
            Alert.alert('Device Linked', 'Your account was successfully linked to this phone.', [
                {
                    text: 'Continue',
                    onPress: () => router.replace('/(tabs)/tab1'),
                },
            ]);
        } catch (error: any) {
            Alert.alert(
                'Linking Failed',
                getApiErrorMessage(error, error?.message || 'Could not link this device to the specified email.')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.page}>
            <SafeAreaView style={styles.safeContainer} edges={['top', 'left', 'right', 'bottom']}>
                <KeyboardAvoidingView
                    style={styles.keyboardContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Header Security Status Badge */}
                        <View style={styles.securityHeader}>
                            <View style={styles.securityBadge}>
                                <Ionicons name="shield-checkmark" size={14} color={AUTH_COLORS.accent} />
                                <Text style={styles.securityBadgeText}>SECURE SIGN IN</Text>
                            </View>
                        </View>

                        {/* Branding Header */}
                        <View style={styles.brandContainer}>
                            <View style={styles.logoCircleWrapper}>
                                <Image
                                    source={require('../../../assets/DGLoGo.jpg')}
                                    style={styles.logoImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text style={styles.brandTitle}>DG NOVA</Text>
                            <Text style={styles.brandTagline}>Quality • Style • Speed</Text>
                            <Text style={styles.brandSub}>Your premier online retail marketplace</Text>
                        </View>

                        {/* Sign-in card */}
                        <View style={styles.vaultCard}>
                            {!isRebindMode ? (
                                <>
                                    <View style={styles.biometricCircleOuter}>
                                        <View style={styles.biometricCircleInner}>
                                            <Ionicons name="finger-print" size={50} color={AUTH_COLORS.accent} />
                                        </View>
                                    </View>

                                    <Text style={styles.cardTitle}>Welcome back</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Sign in securely with your phone&apos;s fingerprint, Face ID, or screen lock.
                                    </Text>

                                    {security.warningMessage && (
                                        <View style={styles.warningBox}>
                                            <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                            <Text style={styles.warningText}>{security.warningMessage}</Text>
                                        </View>
                                    )}

                                    <Button
                                        title={loading ? 'Verifying...' : 'Sign in'}
                                        onPress={handleDeviceUnlock}
                                        loading={loading}
                                        style={styles.unlockBtn}
                                    />

                                    <TouchableOpacity
                                        style={styles.switchModeContainer}
                                        onPress={() => setIsRebindMode(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="phone-portrait-outline" size={16} color={AUTH_COLORS.accent} />
                                        <Text style={styles.switchModeText}>New Phone or Re-link Account?</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <View style={styles.rebindIconContainer}>
                                        <Ionicons name="phone-portrait-outline" size={30} color={AUTH_COLORS.accent} />
                                    </View>

                                    <Text style={styles.cardTitle}>Link your account</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Enter the email on your account, then confirm with your phone&apos;s screen lock.
                                    </Text>

                                    <Text style={styles.fieldLabel}>Account Email</Text>
                                    <Input
                                        placeholder="e.g. name@example.com"
                                        value={rebindEmail}
                                        onChangeText={setRebindEmail}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        style={styles.input}
                                    />

                                    <Button
                                        title={loading ? 'Linking...' : 'Link account'}
                                        onPress={handleRebind}
                                        loading={loading}
                                        style={styles.unlockBtn}
                                    />

                                    <TouchableOpacity
                                        style={styles.switchModeContainer}
                                        onPress={() => setIsRebindMode(false)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="arrow-back" size={16} color={Colors.textMuted} />
                                        <Text style={[styles.switchModeText, { color: Colors.textMuted }]}>
                                            Back to Standard Unlock
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Fast 1-Tap Demo Access Divider & Buttons */}
                            <View style={styles.demoDividerRow}>
                                <View style={styles.demoDividerLine} />
                                <Text style={styles.demoDividerText}>OR 1-TAP DEMO</Text>
                                <View style={styles.demoDividerLine} />
                            </View>

                            <View style={styles.demoButtonRow}>
                                <TouchableOpacity
                                    style={styles.demoLearnerBtn}
                                    onPress={() => handleDemoEnter('user')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="cart-outline" size={16} color={Colors.primary} />
                                    <Text style={styles.demoLearnerBtnText}>Customer Demo</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.demoAdminBtn}
                                    onPress={() => handleDemoEnter('admin')}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="shield-outline" size={16} color="#DC2626" />
                                    <Text style={styles.demoAdminBtnText}>Admin Demo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.footerContainer}>
                            <Text style={styles.footerText}>New here? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={styles.footerLink}>Register</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: AUTH_COLORS.background,
    },
    safeContainer: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    securityHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    securityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: AUTH_COLORS.accentLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1D5C9',
        gap: 6,
    },
    securityBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: AUTH_COLORS.accent,
        letterSpacing: 1.5,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoCircleWrapper: {
        width: 76,
        height: 76,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: AUTH_COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: AUTH_COLORS.border,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: AUTH_COLORS.primary,
        letterSpacing: 2,
    },
    brandTagline: {
        fontSize: 13,
        fontWeight: '800',
        color: AUTH_COLORS.accent,
        letterSpacing: 1.5,
        marginTop: 2,
        textTransform: 'uppercase',
    },
    brandSub: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
        marginTop: 3,
    },
    vaultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: AUTH_COLORS.border,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    biometricCircleOuter: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: AUTH_COLORS.accentLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    biometricCircleInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: AUTH_COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 2,
    },
    rebindIconContainer: {
        alignSelf: 'center',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: AUTH_COLORS.accentLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: AUTH_COLORS.primary,
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: Colors.textMuted,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 17,
        paddingHorizontal: 8,
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FCA5A5',
        borderRadius: 10,
        padding: 8,
        marginBottom: 12,
        gap: 6,
    },
    warningText: {
        fontSize: 11,
        color: '#DC2626',
        fontWeight: '600',
        flex: 1,
    },
    unlockBtn: {
        marginTop: 4,
        marginBottom: 8,
        backgroundColor: AUTH_COLORS.accent,
        borderRadius: 14,
    },
    switchModeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
        paddingVertical: 6,
    },
    switchModeText: {
        fontSize: 12,
        fontWeight: '700',
        color: AUTH_COLORS.accent,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 18,
    },
    footerText: {
        fontSize: 13,
        color: Colors.textMuted,
    },
    footerLink: {
        fontSize: 13,
        fontWeight: '800',
        color: AUTH_COLORS.accent,
    },
    input: {
        borderColor: AUTH_COLORS.border,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
    },
    demoDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
        gap: 8,
    },
    demoDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: AUTH_COLORS.border,
    },
    demoDividerText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textMuted,
        letterSpacing: 1,
    },
    demoButtonRow: {
        flexDirection: 'row',
        gap: 10,
    },
    demoLearnerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEF2FF',
        borderWidth: 1,
        borderColor: '#C7D2FE',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    demoLearnerBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
    },
    demoAdminBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    demoAdminBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#DC2626',
    },
});
