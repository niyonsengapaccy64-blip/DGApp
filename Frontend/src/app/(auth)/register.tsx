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
import FenceLineFrame from '../../components/FenceLineFrame';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { Colors } from '../../constants/Colors';
import { getApiErrorMessage } from '../../services/api';

export default function RegisterScreen() {
    const router = useRouter();
    const { registerWithDevice, loginAsDemo } = useAuth();
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
                'Registration Successful! 🎉',
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

    const handleQuickDemo = async () => {
        try {
            setLoading(true);
            await loginAsDemo('user');
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
                        {/* Security Badge */}
                        <View style={styles.securityHeader}>
                            <View style={styles.securityBadge}>
                                <Ionicons name="key" size={13} color={Colors.primary} />
                                <Text style={styles.securityBadgeText}>PASSWORDLESS BIOMETRIC ENROLLMENT</Text>
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
                            <Text style={styles.brandTitle}>Join DG NOVA</Text>
                            <Text style={styles.brandTagline}>Learn • Explore • Grow</Text>
                            <Text style={styles.brandSub}>Hardware-backed device lock registration</Text>
                        </View>

                        {/* Fenced Card Container */}
                        <View style={styles.fencedCard}>
                            <View style={styles.cardFenceTop} />

                            <Text style={styles.cardTitle}>Create Your Account</Text>
                            <Text style={styles.cardSubtitle}>
                                Enter your email below. Your device lock will authenticate and secure your account.
                            </Text>

                            <Text style={styles.fieldLabel}>Email Address</Text>
                            <Input
                                placeholder="e.g. name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                keyboardType="email-address"
                            />

                            <View style={styles.featureBox}>
                                <View style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                    <Text style={styles.featureText}>No passwords to memorize or lose</Text>
                                </View>
                                <View style={styles.featureRow}>
                                    <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
                                    <Text style={styles.featureText}>Protected by your phone's biometric chip</Text>
                                </View>
                            </View>

                            {security.warningMessage && (
                                <View style={styles.warningBox}>
                                    <Ionicons name="alert-circle" size={16} color="#DC2626" />
                                    <Text style={styles.warningText}>{security.warningMessage}</Text>
                                </View>
                            )}

                            <Button
                                title={loading ? 'Confirming Phone Lock...' : 'Confirm Phone Lock & Register'}
                                onPress={handleRegister}
                                loading={loading}
                                style={styles.registerBtn}
                            />

                            <TouchableOpacity
                                style={styles.quickDemoBtn}
                                onPress={handleQuickDemo}
                                activeOpacity={0.8}
                                disabled={loading}
                            >
                                <Ionicons name="flash-outline" size={16} color={Colors.secondary} />
                                <Text style={styles.quickDemoText}>Skip Setup & Enter as Demo Learner</Text>
                            </TouchableOpacity>

                            <View style={styles.cardFenceBottom} />
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
        backgroundColor: Colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(2, 132, 199, 0.3)',
        gap: 6,
    },
    securityBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: Colors.primaryDark,
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
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: Colors.border,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
    brandTagline: {
        fontSize: 12,
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
    fencedCard: {
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
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
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
    featureBox: {
        backgroundColor: Colors.cardMuted,
        borderRadius: 14,
        padding: 12,
        marginVertical: 12,
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    featureText: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
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
    },
    quickDemoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.secondaryLight,
        paddingVertical: 11,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.25)',
    },
    quickDemoText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.secondaryDark,
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
