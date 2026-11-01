import React, { useState } from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import HamburgerMenuModal, { HamburgerIcon } from '../../components/HamburgerMenuModal';

export default function TabLayout() {
    const { user } = useAuth();
    const { cartCount } = useCart();
    const [menuVisible, setMenuVisible] = useState(false);
    const isAdmin = user?.role === 'admin' || user?.is_admin === true;
    const insets = useSafeAreaInsets();

    const isAndroid = Platform.OS === 'android';
    const bottomPadding = insets.bottom > 0 ? insets.bottom : (isAndroid ? 10 : 8);
    const tabHeight = 56 + bottomPadding;

    return (
        <View style={styles.container}>
            <Tabs
                backBehavior="history"
                screenOptions={{
                    tabBarActiveTintColor: Colors.primary,
                    tabBarInactiveTintColor: Colors.textMuted,
                    tabBarHideOnKeyboard: true,
                    tabBarStyle: {
                        backgroundColor: '#FFFFFF',
                        borderTopColor: Colors.border,
                        borderTopWidth: 1,
                        height: tabHeight,
                        paddingBottom: bottomPadding,
                        paddingTop: 8,
                        elevation: 12,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                    },
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '700',
                        marginTop: 2,
                    },
                    headerStyle: {
                        backgroundColor: Colors.dark,
                        shadowColor: 'transparent',
                        elevation: 0,
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: '800',
                        fontSize: 18,
                        letterSpacing: 0.5,
                    },
                    headerLeft: () => (
                        <View style={styles.headerLeftBadge}>
                            <View style={styles.headerDot} />
                            <Text style={styles.headerBrandText}>DG NOVA</Text>
                        </View>
                    ),
                    headerRight: () => (
                        <HamburgerIcon onPress={() => setMenuVisible(true)} />
                    ),
                }}
            >
                <Tabs.Screen
                    name="tab1"
                    options={{
                        title: isAdmin ? 'Dashboard' : 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name={isAdmin ? 'grid-outline' : 'home-outline'}
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="courses"
                    options={{
                        title: 'Academy',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="school-outline"
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tab2"
                    options={{
                        title: isAdmin ? 'Products' : 'Search',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name={isAdmin ? 'cube-outline' : 'search-outline'}
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tab3"
                    options={{
                        title: isAdmin ? 'Deliveries' : 'Cart',
                        tabBarBadge: !isAdmin && cartCount > 0 ? cartCount : undefined,
                        tabBarBadgeStyle: {
                            backgroundColor: Colors.error,
                            color: '#FFFFFF',
                            fontSize: 10,
                            fontWeight: '800',
                        },
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name={isAdmin ? 'checkmark-done-circle-outline' : 'cart-outline'}
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="tab4"
                    options={{
                        title: isAdmin ? 'Reports' : 'Orders',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name={isAdmin ? 'bar-chart-outline' : 'receipt-outline'}
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, size }) => (
                            <Ionicons
                                name="person-outline"
                                size={size}
                                color={color as string}
                            />
                        ),
                    }}
                />
                {/* Root index redirect so /(tabs) routes smoothly to tab1 */}
                <Tabs.Screen
                    name="index"
                    options={{
                        href: null,
                    }}
                />
            </Tabs>

            {/* TOP-RIGHT HAMBURGER MENU HOLDING ALL TABS */}
            <HamburgerMenuModal
                visible={menuVisible}
                onClose={() => setMenuVisible(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerLeftBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 16,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        gap: 6,
    },
    headerDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: Colors.accent,
    },
    headerBrandText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
});
