import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api, { getApiErrorMessage } from '../../services/api';
import Input from '../../components/Input';
import ProductCard from '../../components/ProductCard';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';

const CATEGORIES = ['All', 'Clothes', 'Shoes', 'Bags', 'Household', 'Jewelry', 'Cosmetics'];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
    All: 'grid-outline',
    Clothes: 'shirt-outline',
    Shoes: 'footsteps-outline',
    Bags: 'bag-handle-outline',
    Household: 'home-outline',
    Jewelry: 'sparkles-outline',
    Cosmetics: 'color-palette-outline',
};

// RWF-based price tiers
const PRICE_FILTERS = ['All Prices', 'Under 50k RWF', '50k-150k RWF', 'Over 150k RWF'];

export default function CustomerSearch() {
    const { lang } = useLanguage();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<any[]>([]);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState('All Prices');
    const [sortAscending, setSortAscending] = useState<boolean | null>(null);

    const fetchFilteredProducts = useCallback(async () => {
        try {
            const url = search.trim() ? `/products/?search=${encodeURIComponent(search.trim())}` : '/products/';
            const res = await api.get(url);
            setProducts(Array.isArray(res.data) ? res.data : []);
            setLoadError(null);
        } catch (error) {
            setProducts([]);
            setLoadError(getApiErrorMessage(error, 'Could not load products. Try again.'));
        }
    }, [search]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            void fetchFilteredProducts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [fetchFilteredProducts]);

    // Filter by Category and Price (RWF tiers)
    const filteredProducts = products.filter((p) => {
        const matchesCategory =
            selectedCategory === 'All' ||
            (p.category || '').toLowerCase() === selectedCategory.toLowerCase();

        const price = parseFloat(p.price || 0);
        let matchesPrice = true;
        if (selectedPriceFilter === 'Under 50k RWF') {
            matchesPrice = price < 50000;
        } else if (selectedPriceFilter === '50k-150k RWF') {
            matchesPrice = price >= 50000 && price <= 150000;
        } else if (selectedPriceFilter === 'Over 150k RWF') {
            matchesPrice = price > 150000;
        }

        return matchesCategory && matchesPrice;
    });

    // Sort by price if toggled
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const priceA = parseFloat(a.price || 0);
        const priceB = parseFloat(b.price || 0);
        if (sortAscending === true) return priceA - priceB;
        if (sortAscending === false) return priceB - priceA;
        return 0;
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
        >
            <View style={styles.container}>
                {/* Search Input Bar */}
                <View style={styles.searchBarWrapper}>
                    <Input
                        placeholder={
                            lang === 'rw'
                                ? 'Shakisha ibicuruzwa ku izina...'
                                : lang === 'fr'
                                ? 'Rechercher par nom de produit...'
                                : 'Search products by name...'
                        }
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchInputContainer}
                        clearButtonMode="while-editing"
                    />
                </View>

                {/* Stunning Horizontal Category Filter Pills (fixed vertical bounds) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filtersScroll}
                    contentContainerStyle={styles.filtersScrollContent}
                >
                    {CATEGORIES.map((cat) => {
                        const isActive = selectedCategory === cat;
                        const iconName = CATEGORY_ICONS[cat] || 'pricetag-outline';
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.filterPill, isActive && styles.filterPillActive]}
                                onPress={() => setSelectedCategory(cat)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={iconName}
                                    size={13}
                                    color={isActive ? '#FFFFFF' : Colors.textMuted}
                                    style={styles.pillIcon}
                                />
                                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Price Filter Pills & Sort Button */}
                <View style={styles.priceRow}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.priceScroll}
                        contentContainerStyle={styles.priceScrollContent}
                    >
                        {PRICE_FILTERS.map((pRange) => {
                            const isPriceActive = selectedPriceFilter === pRange;
                            return (
                                <TouchableOpacity
                                    key={pRange}
                                    style={[styles.pricePill, isPriceActive && styles.pricePillActive]}
                                    onPress={() => setSelectedPriceFilter(pRange)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={[styles.priceText, isPriceActive && styles.priceTextActive]}>
                                        {pRange}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    <TouchableOpacity
                        style={[styles.sortBtn, sortAscending !== null && styles.sortBtnActive]}
                        onPress={() => {
                            if (sortAscending === null) setSortAscending(true);
                            else if (sortAscending === true) setSortAscending(false);
                            else setSortAscending(null);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={sortAscending === true ? 'arrow-up' : sortAscending === false ? 'arrow-down' : 'swap-vertical'}
                            size={13}
                            color={sortAscending !== null ? '#FFFFFF' : Colors.text}
                        />
                        <Text style={[styles.sortBtnText, sortAscending !== null && { color: '#FFFFFF' }]}>
                            {sortAscending === true
                                ? (lang === 'rw' ? 'Igiciro: Hasi' : lang === 'fr' ? 'Prix: Bas' : 'Low')
                                : sortAscending === false
                                ? (lang === 'rw' ? 'Igiciro: Hejuru' : lang === 'fr' ? 'Prix: Haut' : 'High')
                                : (lang === 'rw' ? 'Tondeka' : lang === 'fr' ? 'Trier' : 'Sort')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Products Grid List */}
                <FlatList
                    data={sortedProducts}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(item: any) => item.id.toString()}
                    numColumns={2}
                    columnWrapperStyle={sortedProducts.length > 1 ? styles.row : undefined}
                    contentContainerStyle={{ paddingBottom: 90 }}
                    keyboardDismissMode="on-drag"
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search" size={42} color={Colors.border} style={{ marginBottom: 10 }} />
                            <Text style={styles.emptyText}>
                                {loadError
                                    ? (lang === 'rw'
                                        ? 'Ibicuruzwa ntibishoboye gufunguka.'
                                        : lang === 'fr'
                                        ? 'Impossible de charger les produits.'
                                        : 'Could not load products.')
                                    : lang === 'rw'
                                    ? 'Nta bicuruzwa bihuye byabonetse.'
                                    : lang === 'fr'
                                    ? 'Aucun produit correspondant trouvé.'
                                    : 'No matching products found.'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {loadError
                                    ? loadError
                                    : lang === 'rw'
                                    ? 'Gerageza guhindura ijambo ryo gushakisha cyangwa akayunguruzo.'
                                    : lang === 'fr'
                                    ? 'Essayez de modifier vos termes de recherche ou vos filtres.'
                                    : 'Try adjusting your search terms or filters.'}
                            </Text>
                            {loadError && (
                                <TouchableOpacity
                                    style={styles.retryButton}
                                    onPress={fetchFilteredProducts}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.retryButtonText}>
                                        {lang === 'rw' ? 'Ongera ugerageze' : lang === 'fr' ? 'Réessayer' : 'Try again'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    keyboardContainer: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 8,
        backgroundColor: Colors.background,
    },
    searchBarWrapper: {
        marginBottom: 2,
    },
    searchInputContainer: {
        marginVertical: 2,
    },
    filtersScroll: {
        flexGrow: 0,
        height: 42,
        marginVertical: 6,
    },
    filtersScrollContent: {
        alignItems: 'center',
        paddingHorizontal: 2,
    },
    filterPill: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 34,
        paddingHorizontal: 12,
        borderRadius: 17,
        backgroundColor: '#FFFFFF',
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    filterPillActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    pillIcon: {
        marginRight: 5,
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 36,
        marginBottom: 10,
        gap: 6,
    },
    priceScroll: {
        flexGrow: 0,
        height: 32,
    },
    priceScrollContent: {
        alignItems: 'center',
    },
    pricePill: {
        height: 28,
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        marginRight: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    pricePillActive: {
        backgroundColor: Colors.secondary,
        borderColor: Colors.secondary,
    },
    priceText: {
        fontSize: 11,
        fontWeight: '600',
        color: Colors.textMuted,
    },
    priceTextActive: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    sortBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 28,
        paddingHorizontal: 9,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    sortBtnActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    sortBtnText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.text,
        marginLeft: 4,
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
        marginTop: 4,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 14,
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.primary,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
});
