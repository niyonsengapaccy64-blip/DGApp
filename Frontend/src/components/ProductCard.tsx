import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { formatRWF } from '../constants/i18n';

export default function ProductCard({ product }: { product: any }) {
    const router = useRouter();

    const rawImages: string[] = Array.isArray(product?.images) ? product.images : [];
    const validImages = rawImages.filter((img: any) => typeof img === 'string' && img.startsWith('http'));
    const imageUrl = validImages[0];
    const imageCount = validImages.length;

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/product/${product.id}`)}
            activeOpacity={0.85}
        >
            <View style={styles.imageWrapper}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={28} color={Colors.textLight} />
                    </View>
                )}
                {imageCount > 1 && (
                    <View style={styles.imageBadge}>
                        <Ionicons name="images-outline" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                        <Text style={styles.imageBadgeText}>{imageCount}</Text>
                    </View>
                )}
                {product?.category && (
                    <View style={styles.categoryPill}>
                        <Text style={styles.categoryPillText}>{product.category}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.name} numberOfLines={1}>
                {product?.name || 'Product'}
            </Text>
            <Text style={styles.price}>{formatRWF(parseFloat(product?.price || 0))}</Text>
            {typeof product?.quantity === 'number' && product.quantity <= 5 && product.quantity > 0 && (
                <Text style={styles.lowStock}>Only {product.quantity} left in stock!</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 8,
        marginBottom: 14,
        elevation: 2,
        shadowColor: '#24324A',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: 140,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: Colors.cardMuted,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.cardMuted,
    },
    imageBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(11, 17, 32, 0.75)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    imageBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    categoryPill: {
        position: 'absolute',
        bottom: 6,
        left: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    categoryPillText: {
        color: Colors.text,
        fontSize: 9,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    name: {
        fontSize: 13.5,
        fontWeight: '700',
        color: Colors.text,
        marginTop: 8,
    },
    price: {
        fontSize: 15,
        fontWeight: '900',
        color: '#C76B4A',
        marginTop: 3,
    },
    lowStock: {
        fontSize: 10.5,
        color: Colors.error,
        fontWeight: '800',
        marginTop: 2,
    },
});
