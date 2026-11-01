import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Linking,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const DEV = {
    name: 'Pacifique Niyonsenga',
    role: 'Full-Stack Mobile Engineer & Researcher',
    github: 'https://github.com/niyonsengapaccy64-blip/DGApp',
    email: 'niyonsengapaccy64@gmail.com',
    handle: '@niyonsengapaccy64',
};

export default function DevInfoModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const open = (url: string) => {
        Linking.openURL(url).catch(() => {});
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.gradientStrip} />

                    <View style={styles.avatarWrap}>
                        <View style={styles.avatar}>
                            <Ionicons name="cart" size={28} color="#FFFFFF" />
                        </View>
                    </View>

                    <Text style={styles.devName}>DG NOVA SYSTEM</Text>
                    <Text style={styles.devRole}>Next-Gen E-Commerce Platform</Text>
                    <Text style={styles.devHandle}>Quality • Speed • Reliability</Text>

                    <View style={styles.divider} />

                    <View style={styles.specsContainer}>
                        <Text style={styles.specLabel}>PLATFORM ARCHITECTURE:</Text>
                        <Text style={styles.specItem}>• Framework: React Native 0.88 + React 19</Text>
                        <Text style={styles.specItem}>• Toolchain: Expo SDK 58 (Expo Router v58)</Text>
                        <Text style={styles.specItem}>• Security: Hardware-Backed Device Auth</Text>
                        <Text style={styles.specItem}>• Features: Dynamic Catalog + Order Tracking</Text>
                        <Text style={styles.specItem}>• Navigation: Far Top-Right Hamburger Hub</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.githubBtn}
                        onPress={() => open(DEV.github)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="logo-github" size={18} color="#FFFFFF" />
                        <Text style={styles.btnText}>View GitHub Repository</Text>
                    </TouchableOpacity>

                    <View style={styles.emailRow}>
                        <View style={styles.emailIconWrap}>
                            <Ionicons name="mail" size={14} color={Colors.primary} />
                        </View>
                        <Text style={styles.emailText} numberOfLines={1}>
                            {DEV.email}
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={styles.closeBtnText}>Close Dialog</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

export function DevIcon() {
    const [visible, setVisible] = useState(false);
    return (
        <>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                activeOpacity={0.7}
                style={styles.headerIcon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="hardware-chip-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <DevInfoModal visible={visible} onClose={() => setVisible(false)} />
        </>
    );
}

const styles = StyleSheet.create({
    headerIcon: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 24,
        elevation: 16,
        shadowColor: '#000000',
        shadowOpacity: 0.25,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
    },
    gradientStrip: {
        width: '100%',
        height: 70,
        backgroundColor: Colors.dark,
    },
    avatarWrap: {
        marginTop: -35,
        marginBottom: 10,
    },
    avatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    devName: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
        letterSpacing: 1,
    },
    devRole: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.primary,
        marginTop: 2,
    },
    devHandle: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.accent,
        marginTop: 3,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    divider: {
        width: '84%',
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: 14,
    },
    specsContainer: {
        width: '86%',
        backgroundColor: Colors.cardMuted,
        padding: 12,
        borderRadius: 14,
        marginBottom: 14,
    },
    specLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textMuted,
        letterSpacing: 1,
        marginBottom: 6,
    },
    specItem: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.text,
        lineHeight: 18,
    },
    githubBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.dark,
        paddingVertical: 11,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
        width: '86%',
        marginBottom: 10,
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    emailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primaryLight,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        width: '86%',
        marginBottom: 16,
        gap: 8,
    },
    emailIconWrap: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailText: {
        fontSize: 11,
        color: Colors.primaryDark,
        fontWeight: '600',
        flex: 1,
    },
    closeBtn: {
        backgroundColor: Colors.cardMuted,
        paddingHorizontal: 28,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    closeBtnText: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '700',
    },
});
