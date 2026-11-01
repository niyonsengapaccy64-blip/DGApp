import React, { useState, useEffect, useCallback } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useDeviceAuth } from '../../hooks/useDeviceAuth';
import FenceLineFrame from '../../components/FenceLineFrame';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { getApiErrorMessage } from '../../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const { loginWithDevice, rebindDeviceWithLock, loginAsDemo, deviceToken } = useAuth();
    const { security } = useDeviceAuth();

    const [isRebindMode, setIsRebindMode] = useState(false);
    const [rebindEmail, setRebindEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasAttemptedAutoPrompt, setHasAttemptedAutoPrompt] = useState(false);

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
                    'This device is not yet linked. You can claim/rebind this phone, or tap "Quick Demo Mode" below to explore immediately.'
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

    const handleDemoLogin = async (role: 'user' | 'admin') => {
        try {
            setLoading(true);
            await loginAsDemo(role);
            router.replace('/(tabs)/tab1');
        } catch (e) {
            Alert.alert('Error', 'Could not start demo session.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FenceLineFrame color={Colors.primary}>
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
                                <Ionicons name="shield-checkmark" size={14} color={Colors.accent} />
                                <Text style={styles.securityBadgeText}>DG NOVA UNIFIED PLATFORM</Text>
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
                            <Text style={styles.brandTagline}>Learn • Explore • Grow</Text>
                            <Text style={styles.brandSub}>Retail Market & Course Academy</Text>
                        </View>

                        {/* Main Vault Auth Card */}
                        <View style={styles.vaultCard}>
                            <View style={styles.cardFenceTop} />

                            {!isRebindMode ? (
                                <>
                                    {/* Normal Login: Pure Phone Lock */}
                                    <View style={styles.biometricCircleOuter}>
                                        <View style={styles.biometricCircleInner}>
                                            <Ionicons name="finger-print" size={50} color={Colors.primary} />
                                        </View>
                                    </View>

                                    <Text style={styles.cardTitle}>Instant Secure Sign-In</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Use Face ID, fingerprint, device PIN, or 1-tap demo testing
                                    </Text>

                                    {security.warningMessage && (
                                        <View style={styles.warningBox}>
                                            <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                            <Text style={styles.warningText}>{security.warningMessage}</Text>
                                        </View>
                                    )}

                                    <Button
                                        title={loading ? 'Verifying Lock...' : 'Unlock Account with Phone Lock'}
                                        onPress={handleDeviceUnlock}
                                        loading={loading}
                                        style={styles.unlockBtn}
                                    />

                                    {/* INSTANT DEMO TESTING DIVIDER */}
                                    <View style={styles.demoDividerRow}>
                                        <View style={styles.demoDividerLine} />
                                        <Text style={styles.demoDividerText}>OR 1-TAP DEMO ACCESS</Text>
                                        <View style={styles.demoDividerLine} />
                                    </View>

                                    {/* DEMO BUTTONS FOR ZERO-FRICTION EXPO TESTING */}
                                    <View style={styles.demoButtonsGrid}>
                                        <TouchableOpacity
                                            style={styles.demoCustomerBtn}
                                            onPress={() => handleDemoLogin('user')}
                                            activeOpacity={0.85}
                                            disabled={loading}
                                        >
                                            <Ionicons name="school-outline" size={18} color="#FFFFFF" />
                                            <Text style={styles.demoCustomerBtnText}>Explore as Learner / Buyer</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.demoAdminBtn}
                                            onPress={() => handleDemoLogin('admin')}
                                            activeOpacity={0.85}
                                            disabled={loading}
                                        >
                                            <Ionicons name="shield-outline" size={18} color={Colors.primary} />
                                            <Text style={styles.demoAdminBtnText}>Explore as Store Admin</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Switch to Rebind / New Phone Mode */}
                                    <TouchableOpacity
                                        style={styles.switchModeContainer}
                                        onPress={() => setIsRebindMode(true)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="phone-portrait-outline" size={16} color={Colors.primary} />
                                        <Text style={styles.switchModeText}>New Phone or Re-link Account?</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Rebind / Recovery Flow for New Phones */}
                                    <View style={styles.rebindIconContainer}>
                                        <Ionicons name="swap-horizontal" size={32} color={Colors.primary} />
                                    </View>

                                    <Text style={styles.cardTitle}>Claim / Rebind Device</Text>
                                    <Text style={styles.cardSubtitle}>
                                        Link your existing account to this phone using your active screen lock
                                    </Text>

                                    <Text style={styles.fieldLabel}>Account Email</Text>
                                    <Input
                                        placeholder="e.g. name@example.com"
                                        value={rebindEmail}
                                        onChangeText={setRebindEmail}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                    />

                                    <Button
                                        title={loading ? 'Confirming Lock...' : 'Verify Phone Lock & Link'}
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

                            <View style={styles.cardFenceBottom} />
                        </View>

                        {/* Footer Switch to Register */}
                        <View style={styles.footerContainer}>
                            <Text style={styles.footerText}>New to DG NOVA? </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={styles.footerLink}>Register New Device</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </FenceLineFrame>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
        gap: 6,
    },
    securityBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.accent,
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
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 2,
    },
    brandTagline: {
        fontSize: 13,
        fontWeight: '800',
        color: Colors.primary,
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
        backgroundColor: Colors.card,
        borderRadius: 24,
        padding: 22,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    cardFenceTop: {
        height: 3,
        backgroundColor: Colors.primary,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    cardFenceBottom: {
        height: 3,
        backgroundColor: Colors.secondary,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    biometricCircleOuter: {
        alignSelf: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primaryLight,
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
        shadowColor: Colors.primary,
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
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
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
    },
    demoDividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
    },
    demoDividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    demoDividerText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textLight,
        letterSpacing: 1.2,
        paddingHorizontal: 10,
    },
    demoButtonsGrid: {
        gap: 8,
        marginBottom: 12,
    },
    demoCustomerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondary,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8,
        shadowColor: Colors.secondary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    demoCustomerBtnText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    demoAdminBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primaryLight,
        paddingVertical: 11,
        borderRadius: 14,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.3)',
    },
    demoAdminBtnText: {
        color: Colors.primaryDark,
        fontSize: 13,
        fontWeight: '800',
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
        color: Colors.primary,
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
        color: Colors.primary,
    },
});
