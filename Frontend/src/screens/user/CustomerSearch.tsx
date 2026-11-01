import React, { useState, useEffect } from 'react';
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
import api from '../../services/api';
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

const FALLBACK_SEARCH_PRODUCTS = [
    {
        id: 1,
        name: 'Kigali Executive Trench Coat',
        category: 'Clothes',
        price: 48000,
        quantity: 12,
        images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'],
        description: 'Premium tailored waterproof trench coat designed for Rwandan professionals. Elegant double-breasted cut with inner pockets.',
    },
    {
        id: 2,
        name: 'Handcrafted Rwandan Leather Loafers',
        category: 'Shoes',
        price: 55000,
        quantity: 8,
        images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800'],
        description: 'Artisan full-grain leather loafers made in Gatsibo. Cushioned insole for all-day comfort and long-lasting durability.',
    },
    {
        id: 3,
        name: 'Modern Agaseke Weaved Leather Tote',
        category: 'Bags',
        price: 38000,
        quantity: 15,
        images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'],
        description: 'Contemporary tote bag combining traditional Rwandan Agaseke geometric weaving patterns with luxury supple leather.',
    },
    {
        id: 4,
        name: 'Imigongo Artisan Ceramic Coffee Set',
        category: 'Household',
        price: 32000,
        quantity: 10,
        images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800'],
        description: 'Set of 6 handcrafted ceramic cups and pour-over kettle featuring iconic Rwandan Imigongo spiral art.',
    },
    {
        id: 5,
        name: 'Gisagara Brass & Malachite Cuff',
        category: 'Jewelry',
        price: 22000,
        quantity: 20,
        images: ['https://images.unsplash.com/photo-1611591475155-42646274494c?w=800'],
        description: 'Hand-hammered solid brass cuff bracelet inlaid with polished green malachite stone from East Africa.',
    },
    {
        id: 6,
        name: 'Pure Nyungwe Botanicals Glow Serum',
        category: 'Cosmetics',
        price: 18000,
        quantity: 25,
        images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
        description: 'Organic cold-pressed facial serum enriched with Moringa and wild botanical extracts from the Nyungwe rainforest.',
    },
];

let cachedSearchProducts: any[] = FALLBACK_SEARCH_PRODUCTS;

export default function CustomerSearch() {
    const { t, lang } = useLanguage();
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState<any[]>(cachedSearchProducts);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceFilter, setSelectedPriceFilter] = useState('All Prices');
    const [sortAscending, setSortAscending] = useState<boolean | null>(null);

    useEffect(() => {
        if (cachedSearchProducts.length === 0) {
            fetchFilteredProducts();
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchFilteredProducts();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [search]);

    const fetchFilteredProducts = async () => {
        try {
            const url = search.trim() ? `/products/?search=${encodeURIComponent(search.trim())}` : '/products/';
            const res = await api.get(url);
            const data = res.data && res.data.length > 0 ? res.data : (!search.trim() ? FALLBACK_SEARCH_PRODUCTS : FALLBACK_SEARCH_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())));
            if (!search.trim()) cachedSearchProducts = data;
            setProducts(data);
        } catch {
            setProducts(!search.trim() ? FALLBACK_SEARCH_PRODUCTS : FALLBACK_SEARCH_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())));
        }
    };

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
                                {lang === 'rw' ? 'Nta bicuruzwa bihuye byabonetse.' : lang === 'fr' ? 'Aucun produit correspondant trouvé.' : 'No matching products found.'}
                            </Text>
                            <Text style={styles.emptySubtext}>
                                {lang === 'rw' ? 'Gerageza guhindura ijambo ryo gushakisha cyangwa akayunguruzo.' : lang === 'fr' ? 'Essayez de modifier vos termes de recherche ou vos filtres.' : 'Try adjusting your search terms or filters.'}
                            </Text>
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
});
