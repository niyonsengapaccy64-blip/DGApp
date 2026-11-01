import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Text,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';
import { formatRWF } from '../../constants/i18n';
import { getApiErrorMessage } from '../../services/api';

const CATEGORIES = ['All', 'Clothes', 'Shoes', 'Bags', 'Household', 'Jewelry', 'Cosmetics'];
const POLL_INTERVAL_MS = 6000;

let cachedProducts: any[] = [];
let cachedPendingOrders: any[] = [];

export default function CustomerHome() {
    const router = useRouter();
    const { token } = useAuth();
    const { t, lang } = useLanguage();
    const [products, setProducts] = useState<any[]>(cachedProducts);
    const [productsError, setProductsError] = useState<string | null>(null);
    const [pendingOrders, setPendingOrders] = useState<any[]>(cachedPendingOrders);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const formatOrderRef = (id: string) => {
        if (!id) return '#ORD-001';
        if (id.startsWith('ORD-')) return `#${id}`;
        if (!isNaN(Number(id))) return `#ORD-${id}`;
        return `#ORD-${id.replace(/-/g, '').slice(0, 5).toUpperCase()}`;
    };

    const fetchData = useCallback(async (silent = false) => {
        try {
            if (!silent && products.length === 0) setLoading(true);
            const productsPromise = api.get('/products/');
            const ordersPromise = token
                ? api.get('/orders/').catch(() => ({ data: [] }))
                : Promise.resolve({ data: [] });

            const [productsRes, ordersRes] = await Promise.all([productsPromise, ordersPromise]);

            const liveProducts = Array.isArray(productsRes.data) ? productsRes.data : [];
            cachedProducts = liveProducts;
            setProducts(liveProducts);
            setProductsError(null);

            const allOrders: any[] = ordersRes.data || [];
            const pending = allOrders.filter((o) => !o.delivered);
            cachedPendingOrders = pending;
            setPendingOrders(pending);
        } catch (error) {
            setProductsError(getApiErrorMessage(error, 'Could not load products. Pull down to try again.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, products.length]);

    useEffect(() => {
        fetchData();

        if (token) {
            pollRef.current = setInterval(() => {
                fetchData(true);
            }, POLL_INTERVAL_MS);
        }

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchData, token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(true);
    };

    const handleConfirmDeliveryFromBanner = (order: any) => {
        const orderRef = formatOrderRef(order.id);
        Alert.alert(
            t.confirmDelivery,
            lang === 'rw'
                ? `Wabonye ibicuruzwa bya ${orderRef}? Emeza uzarangize igabana ry'itangwa.`
                : lang === 'fr'
                ? `Avez-vous reçu votre colis pour ${orderRef}? Confirmer complète le processus de livraison.`
                : `Have you received your package for ${orderRef}?\nConfirming marks the delivery handshake as complete.`,
            [
                {
                    text: lang === 'rw' ? 'Reba Amateka' : lang === 'fr' ? 'Voir les commandes' : 'View All Orders',
                    onPress: () => router.push('/(tabs)/tab4'),
                },
                {
                    text: lang === 'rw' ? 'Yego, Byatanzwe!' : lang === 'fr' ? 'Oui, Reçu!' : 'Yes, Delivered!',
                    onPress: async () => {
                        setPendingOrders((prev) => prev.filter((o) => o.id !== order.id));
                        cachedPendingOrders = cachedPendingOrders.filter((o) => o.id !== order.id);

                        try {
                            await api.patch(`/orders/${order.id}/deliver`);
                            Alert.alert(
                                t.success,
                                `${lang === 'rw' ? 'Itangwa rya' : lang === 'fr' ? 'Commande' : 'Order'} ${orderRef} ${
                                    lang === 'rw' ? 'ryemejwe!' : lang === 'fr' ? 'confirmée!' : 'confirmed!'
                                }`
                            );
                            fetchData(true);
                        } catch {
                            fetchData(true);
                        }
                    },
                },
            ]
        );
    };

    if (loading && products.length === 0) {
        return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
    }

    const filteredProducts =
        selectedCategory === 'All'
            ? products
            : products.filter(
                  (p) => (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
              );

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredProducts}
                renderItem={({ item }) => <ProductCard product={item} />}
                keyExtractor={(item: any) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={filteredProducts.length > 1 ? styles.row : undefined}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 32 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        {/* IN-APP DELIVERY HANDSHAKE NOTIFICATION BANNER */}
                        {pendingOrders.length > 0 && (
                            <TouchableOpacity
                                style={styles.notificationBanner}
                                onPress={() => handleConfirmDeliveryFromBanner(pendingOrders[0])}
                                activeOpacity={0.85}
                            >
                                <View style={styles.bannerIconBox}>
                                    <Ionicons name="notifications" size={18} color="#FFFFFF" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bannerTitle}>
                                        {lang === 'rw'
                                            ? 'Ibicuruzwa biri mu nzira 🚚'
                                            : lang === 'fr'
                                            ? 'Livraison en cours 🚚'
                                            : 'Delivery In Transit 🚚'}
                                    </Text>
                                    <Text style={styles.bannerSub} numberOfLines={1}>
                                        {lang === 'rw'
                                            ? `Iyangu ${formatOrderRef(pendingOrders[0].id)} iri mu nzira! Kanda kugira ngo wemeze.`
                                            : lang === 'fr'
                                            ? `Commande ${formatOrderRef(pendingOrders[0].id)} arrive! Appuyez pour confirmer.`
                                            : `Order ${formatOrderRef(pendingOrders[0].id)} is arriving! Tap to confirm receipt.`}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                            </TouchableOpacity>
                        )}

                        {/* ========================================================= */}
                        {/* HERO BANNER: Exact user requirements & actions */}
                        {/* ========================================================= */}
                        <View style={styles.courseHeroBanner}>
                            <View style={styles.heroGlowAccent} />
                            <View style={styles.courseBadgeRow}>
                                <View style={styles.courseBadge}>
                                    <Ionicons name="school" size={14} color={Colors.accent} />
                                    <Text style={styles.courseBadgeText}>DG ACADEMY & COURSES</Text>
                                </View>
                                <View style={styles.liveTagPill}>
                                    <Text style={styles.liveTagText}>ACTIVE CATALOGUE</Text>
                                </View>
                            </View>

                            <Text style={styles.courseHeroTitle}>Knowledge & Skill Catalogue</Text>
                            <Text style={styles.courseHeroSubtitle}>
                                Browse available courses, explore course details, or add a new course to your catalogue.
                            </Text>

                            <View style={styles.courseButtonRow}>
                                <TouchableOpacity
                                    style={styles.browseCoursesBtn}
                                    onPress={() => router.push('/(tabs)/courses')}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="compass" size={16} color="#FFFFFF" />
                                    <Text style={styles.browseCoursesText}>Browse Courses</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.addCourseBtn}
                                    onPress={() => router.push({ pathname: '/(tabs)/courses', params: { action: 'add' } })}
                                    activeOpacity={0.85}
                                >
                                    <Ionicons name="add-circle" size={16} color={Colors.primary} />
                                    <Text style={styles.addCourseText}>+ Add a Course</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.taglineBox}>
                                <Text style={styles.taglineText}>Learn • Explore • Grow</Text>
                            </View>
                        </View>

                        {/* CATEGORY FILTER PILLS */}
                        <View style={styles.categoryContainer}>
                            <View style={styles.categoryTitleRow}>
                                <Text style={styles.categoryHeaderTitle}>Retail Market Catalogue</Text>
                                <Text style={styles.categoryCountText}>{filteredProducts.length} items</Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.categoryScroll}
                            >
                                {CATEGORIES.map((cat) => {
                                    const active = selectedCategory === cat;
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryPill,
                                                active && styles.categoryPillActive,
                                            ]}
                                            onPress={() => setSelectedCategory(cat)}
                                            activeOpacity={0.8}
                                        >
                                            <Text
                                                style={[
                                                    styles.categoryText,
                                                    active && styles.categoryTextActive,
                                                ]}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="basket-outline" size={48} color={Colors.border} style={{ marginBottom: 10 }} />
                        <Text style={styles.emptyText}>
                            {productsError
                                ? (lang === 'rw'
                                    ? 'Ibicuruzwa ntibishoboye gufunguka.'
                                    : lang === 'fr'
                                    ? 'Impossible de charger les produits.'
                                    : 'Could not load products.')
                                : lang === 'rw'
                                ? `Nta bicuruzwa muri "${selectedCategory}".`
                                : lang === 'fr'
                                ? `Aucun produit dans "${selectedCategory}".`
                                : `No products found in "${selectedCategory}".`}
                        </Text>
                        <Text style={styles.emptySubtext}>
                            {productsError
                                ? productsError
                                : lang === 'rw'
                                ? 'Hitamo icyiciro cindi cyangwa gukurura hasi.'
                                : lang === 'fr'
                                ? 'Choisissez une autre catégorie ou faites glisser vers le bas.'
                                : 'Select another category or pull down to refresh.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 14,
        backgroundColor: Colors.background,
    },
    listHeader: {
        paddingTop: 10,
    },
    notificationBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderWidth: 1.5,
        borderColor: '#A7F3D0',
        borderRadius: 16,
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    bannerIconBox: {
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    bannerTitle: { fontSize: 13, fontWeight: '800', color: '#065F46' },
    bannerSub: { fontSize: 12, color: '#047857', marginTop: 1 },

    // COURSE HERO BANNER
    courseHeroBanner: {
        backgroundColor: Colors.dark,
        borderRadius: 22,
        padding: 18,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    heroGlowAccent: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: 'rgba(2, 132, 199, 0.25)',
    },
    courseBadgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    courseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.18)',
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.4)',
        gap: 6,
    },
    courseBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.accent,
        letterSpacing: 1.2,
    },
    liveTagPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    liveTagText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#E2E8F0',
    },
    courseHeroTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 6,
    },
    courseHeroSubtitle: {
        fontSize: 13,
        lineHeight: 18,
        color: '#CBD5E1',
        marginBottom: 14,
    },
    courseButtonRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 12,
    },
    browseCoursesBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.primary,
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 3,
    },
    browseCoursesText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    addCourseBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 11,
        paddingHorizontal: 12,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    addCourseText: {
        color: Colors.primary,
        fontSize: 12,
        fontWeight: '800',
    },
    taglineBox: {
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    taglineText: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.accent,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },

    // RETAIL CATEGORIES
    categoryContainer: {
        marginBottom: 10,
    },
    categoryTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryHeaderTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    categoryCountText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    categoryScroll: {
        paddingVertical: 4,
        gap: 8,
    },
    categoryPill: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: Colors.card,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryPillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    categoryTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    row: {
        justifyContent: 'space-between',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.text,
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 13,
        color: Colors.textMuted,
        marginTop: 6,
        textAlign: 'center',
    },
});
