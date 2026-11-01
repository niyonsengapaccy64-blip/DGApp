import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    Pressable,
    Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../constants/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 360);

interface NavItem {
    key: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    route: string;
    badge?: string;
    badgeColor?: string;
}

export function HamburgerIcon({ onPress }: { onPress: () => void }) {
    const { cartCount } = useCart();
    return (
        <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={onPress}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <View style={styles.hamburgerIconBox}>
                <Ionicons name="menu" size={24} color="#FFFFFF" />
                {cartCount > 0 && <View style={styles.cartDot} />}
            </View>
        </TouchableOpacity>
    );
}

export default function HamburgerMenuModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const { lang, setLang } = useLanguage();

    const isAdmin = user?.role === 'admin' || user?.is_admin === true;

    const navItems: NavItem[] = [
        {
            key: 'courses',
            title: 'Academy',
            icon: 'school-outline',
            activeIcon: 'school',
            route: '/(tabs)/courses',
        },
        {
            key: 'tab1',
            title: isAdmin ? 'Dashboard' : 'Home',
            icon: isAdmin ? 'grid-outline' : 'home-outline',
            activeIcon: isAdmin ? 'grid' : 'home',
            route: '/(tabs)/tab1',
        },
        {
            key: 'tab2',
            title: isAdmin ? 'Products' : 'Search',
            icon: isAdmin ? 'cube-outline' : 'search-outline',
            activeIcon: isAdmin ? 'cube' : 'search',
            route: '/(tabs)/tab2',
        },
        {
            key: 'tab3',
            title: isAdmin ? 'Deliveries' : 'Cart',
            icon: isAdmin ? 'checkmark-done-circle-outline' : 'cart-outline',
            activeIcon: isAdmin ? 'checkmark-done-circle' : 'cart',
            route: '/(tabs)/tab3',
            badge: !isAdmin && cartCount > 0 ? `${cartCount}` : undefined,
            badgeColor: Colors.error,
        },
        {
            key: 'tab4',
            title: isAdmin ? 'Reports' : 'Orders',
            icon: isAdmin ? 'bar-chart-outline' : 'receipt-outline',
            activeIcon: isAdmin ? 'bar-chart' : 'receipt',
            route: '/(tabs)/tab4',
        },
        {
            key: 'profile',
            title: 'Profile',
            icon: 'person-outline',
            activeIcon: 'person',
            route: '/(tabs)/profile',
        },
    ];

    const handleNavigate = (route: string) => {
        onClose();
        setTimeout(() => {
            router.push(route as any);
        }, 120);
    };

    const handleLogout = async () => {
        onClose();
        await logout();
        router.replace('/(auth)/login');
    };

    return (
        <>
            <Modal
                visible={visible}
                animationType="fade"
                transparent
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <Pressable style={styles.backdrop} onPress={onClose} />
                    <View style={styles.drawer}>
                        {/* DRAWER HEADER */}
                        <View style={styles.drawerHeader}>
                            <View style={styles.userSection}>
                                <View style={styles.avatarBox}>
                                    <Ionicons
                                        name={isAdmin ? 'shield-checkmark' : 'person'}
                                        size={22}
                                        color="#FFFFFF"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.roleBadgeRow}>
                                        <View
                                            style={[
                                                styles.roleBadge,
                                                { backgroundColor: isAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.12)' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.roleBadgeText,
                                                    { color: isAdmin ? '#F87171' : '#E2E8F0' },
                                                ]}
                                            >
                                                {isAdmin ? 'ADMIN' : 'ACCOUNT'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.userEmail} numberOfLines={1}>
                                        {user?.email || 'Guest Session'}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={onClose}
                                style={styles.closeBtn}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.drawerContent}
                        >
                            <Text style={styles.sectionHeading}>MENU</Text>

                            {/* NAVIGATION ITEMS */}
                            {navItems.map((item) => {
                                const isActive = pathname.includes(item.key);
                                return (
                                    <TouchableOpacity
                                        key={item.key}
                                        style={[styles.navRow, isActive && styles.navRowActive]}
                                        onPress={() => handleNavigate(item.route)}
                                        activeOpacity={0.8}
                                    >
                                        <View
                                            style={[
                                                styles.navIconBox,
                                                isActive && styles.navIconBoxActive,
                                            ]}
                                        >
                                            <Ionicons
                                                name={isActive ? item.activeIcon : item.icon}
                                                size={20}
                                                color={isActive ? Colors.primary : Colors.textMuted}
                                            />
                                        </View>

                                        <View style={styles.navTitleContainer}>
                                            <Text
                                                style={[
                                                    styles.navTitle,
                                                    isActive && styles.navTitleActive,
                                                ]}
                                            >
                                                {item.title}
                                            </Text>
                                            {item.badge && (
                                                <View
                                                    style={[
                                                        styles.navBadge,
                                                        { backgroundColor: item.badgeColor || Colors.primary },
                                                    ]}
                                                >
                                                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                                                </View>
                                            )}
                                        </View>

                                        <Ionicons
                                            name="chevron-forward"
                                            size={16}
                                            color={isActive ? Colors.primary : Colors.textLight}
                                        />
                                    </TouchableOpacity>
                                );
                            })}

                            {/* TOOLS & PREFERENCES */}
                            <Text style={[styles.sectionHeading, { marginTop: 20 }]}>
                                PREFERENCES & CONTROLS
                            </Text>

                            {/* LANGUAGE SWITCHER */}
                            <View style={styles.languageCard}>
                                <View style={styles.languageHeader}>
                                    <Ionicons name="globe-outline" size={16} color={Colors.primary} />
                                    <Text style={styles.languageTitle}>Language / Ururimi</Text>
                                </View>
                                <View style={styles.langPillsRow}>
                                    {(
                                        [
                                            { code: 'en', label: '🇬🇧 English' },
                                            { code: 'rw', label: '🇷🇼 Kinyarwanda' },
                                            { code: 'fr', label: '🇫🇷 Français' },
                                        ] as const
                                    ).map((l) => (
                                        <TouchableOpacity
                                            key={l.code}
                                            style={[
                                                styles.langPill,
                                                lang === l.code && styles.langPillActive,
                                            ]}
                                            onPress={() => setLang(l.code as Language)}
                                        >
                                            <Text
                                                style={[
                                                    styles.langPillText,
                                                    lang === l.code && styles.langPillTextActive,
                                                ]}
                                            >
                                                {l.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* LOGOUT */}
                            <TouchableOpacity
                                style={styles.logoutBtn}
                                onPress={handleLogout}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="log-out-outline" size={18} color={Colors.error} />
                                <Text style={styles.logoutText}>Sign out</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

        </>
    );
}

const styles = StyleSheet.create({
    hamburgerBtn: {
        padding: 6,
        marginRight: 6,
    },
    hamburgerIconBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        position: 'relative',
    },
    cartDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.accent,
        borderWidth: 1.5,
        borderColor: Colors.dark,
    },
    overlay: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
    },
    backdrop: {
        flex: 1,
    },
    drawer: {
        width: DRAWER_WIDTH,
        backgroundColor: Colors.dark,
        height: '100%',
        paddingTop: Platform.OS === 'ios' ? 50 : 36,
        paddingBottom: 24,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: -4, height: 0 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 20,
    },
    drawerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    avatarBox: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleBadgeRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    userEmail: {
        fontSize: 12,
        fontWeight: '600',
        color: '#E2E8F0',
    },
    closeBtn: {
        padding: 6,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    drawerContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 30,
    },
    sectionHeading: {
        fontSize: 10,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1.5,
        marginBottom: 10,
        paddingHorizontal: 4,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        marginBottom: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    navRowActive: {
        backgroundColor: 'rgba(2, 132, 199, 0.15)',
        borderColor: 'rgba(2, 132, 199, 0.4)',
    },
    navIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    navIconBoxActive: {
        backgroundColor: Colors.primaryLight,
    },
    navTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#F1F5F9',
    },
    navTitleActive: {
        color: '#38BDF8',
        fontWeight: '800',
    },
    navTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    navBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    navBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
    },
    languageCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        marginBottom: 10,
    },
    languageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    languageTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    langPillsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    langPill: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
    },
    langPillActive: {
        backgroundColor: Colors.primary,
    },
    langPillText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#94A3B8',
    },
    langPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
    },
    logoutText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F87171',
    },
});
