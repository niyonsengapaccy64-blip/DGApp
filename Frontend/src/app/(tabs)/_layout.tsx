import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';
import HamburgerMenuModal, { HamburgerIcon } from '../../components/HamburgerMenuModal';

export default function TabLayout() {
    const { user } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const isAdmin = user?.role === 'admin' || user?.is_admin === true;

    return (
        <View style={styles.container}>
            <Tabs
                backBehavior="history"
                screenOptions={{
                    tabBarStyle: { display: 'none' },
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
                    options={{ title: isAdmin ? 'Dashboard' : 'Home' }}
                />
                <Tabs.Screen
                    name="tab2"
                    options={{ title: isAdmin ? 'Products' : 'Search' }}
                />
                <Tabs.Screen
                    name="tab3"
                    options={{ title: isAdmin ? 'Deliveries' : 'Cart' }}
                />
                <Tabs.Screen
                    name="tab4"
                    options={{ title: isAdmin ? 'Reports' : 'Orders' }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{ title: 'Profile' }}
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
