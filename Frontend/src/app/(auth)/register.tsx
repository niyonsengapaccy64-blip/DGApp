import React, { useState } from 'react';
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

export default function RegisterScreen() {
    const router = useRouter();
    const { registerWithDevice } = useAuth();
    const { security } = useDeviceAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            return Alert.alert('Missing Field', 'Please enter your email address to continue.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return Alert.alert('Invalid Email', 'Please enter a valid email address (e.g. name@example.com).');
        }

        try {
            setLoading(true);
            await registerWithDevice(trimmedEmail);
            Alert.alert(
                'Registration successful',
                'Your account has been created and bound to this device screen lock.',
                [
                    {
                        text: 'Go to Dashboard',
                        onPress: () => router.replace('/(tabs)/tab1'),
                    },
                ]
            );
        } catch (error: any) {
            Alert.alert(
                'Registration Failed',
                getApiErrorMessage(error, error?.message || 'Could not register account. Please try again.')
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
                        {/* Security Badge */}
                        <View style={styles.securityHeader}>
                            <View style={styles.securityBadge}>
                                <Ionicons name="shield-checkmark" size={13} color={AUTH_COLORS.accent} />
                                <Text style={styles.securityBadgeText}>CREATE YOUR ACCOUNT</Text>
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
                            <Text style={styles.brandTagline}>Shop, learn, and grow</Text>
                            <Text style={styles.brandSub}>Your marketplace and academy</Text>
                        </View>

                        <View style={styles.registerCard}>
                            <Text style={styles.cardTitle}>Register</Text>
                            <Text style={styles.cardSubtitle}>
                                Add your email, then confirm with your phone&apos;s screen lock.
                            </Text>

                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <Input
                                placeholder="e.g. name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                                style={styles.input}
                            />

                            {security.warningMessage && (
                                <View style={styles.warningBox}>
                                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                    <Text style={styles.warningText}>{security.warningMessage}</Text>
                                </View>
                            )}

                            <Button
                                title={loading ? 'Registering...' : 'Register'}
                                onPress={handleRegister}
                                loading={loading}
                                style={styles.registerBtn}
                            />

                        </View>

                        {/* Footer Switch */}
                        <View style={styles.footerContainer}>
                            <Text style={styles.footerText}>Already registered on this phone? </Text>
                            <TouchableOpacity
                                onPress={() => router.replace('/(auth)/login')}
                                activeOpacity={0.7}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Text style={styles.footerLink}>Sign In</Text>
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
        fontSize: 9,
        fontWeight: '800',
        color: AUTH_COLORS.accent,
        letterSpacing: 1.2,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logoCircleWrapper: {
        width: 72,
        height: 72,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        shadowColor: AUTH_COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: AUTH_COLORS.border,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: AUTH_COLORS.primary,
        letterSpacing: 1,
    },
    brandTagline: {
        fontSize: 12,
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
    registerCard: {
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
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: AUTH_COLORS.primary,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: Colors.textMuted,
        marginBottom: 14,
        lineHeight: 18,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 6,
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
    registerBtn: {
        marginTop: 4,
        marginBottom: 10,
        backgroundColor: AUTH_COLORS.accent,
        borderRadius: 14,
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
});
