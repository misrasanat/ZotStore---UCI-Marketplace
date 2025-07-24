import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { db } from '../firebase';
import { getDoc, doc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';

const MyListingsScreen = ({ navigation }) => {
    const [currentListings, setCurrentListings] = useState([]);
    const [pastListings, setPastListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCurrent, setShowCurrent] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const filterListings = (listings) => {
        if (!searchQuery.trim()) return listings;
        const query = searchQuery.toLowerCase();
        return listings.filter(item => 
            item.name.toLowerCase().includes(query) || 
            (item.desc && item.desc.toLowerCase().includes(query))
        );
    };

    const filteredCurrentListings = filterListings(currentListings);
    const filteredPastListings = filterListings(pastListings);

    useEffect(() => {
        const fetchUserListings = async () => {
            setLoading(true);
            try {
                const auth = getAuth();
                const user = auth.currentUser;

                if (!user) return;

                const userListingsSnapshot = await getDocs(collection(db, `users/${user.uid}/listings`));
                const listings = [];

                for (const docSnap of userListingsSnapshot.docs) {
                    const { listingId } = docSnap.data();
                    const listingDoc = await getDoc(doc(db, 'listings', listingId));
                    if (listingDoc.exists()) {
                        listings.push({
                            id: listingDoc.id,
                            ...listingDoc.data()
                        });
                    }
                }

                const currentListings = listings.filter(l => l.status === 'active');
                const pastListings = listings.filter(l => l.status === 'past');
                setCurrentListings(currentListings);
                setPastListings(pastListings);
            } catch (error) {
                console.error("Failed to fetch user listings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserListings();
    }, []);

    const renderItem = ({ item }) => {
        const hasError = imageErrors[item.id];
        const formattedPrice = parseFloat(item.price).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
        });

        return (
            <TouchableOpacity 
                style={styles.card} 
                onPress={() => navigation.navigate('View Listing', { item })}
                activeOpacity={0.7}
            >
                {!hasError && item.image ? (
                    <Image
                        source={{ uri: item.image }}
                        style={styles.cardImage}
                        resizeMode="cover"
                        onError={() => setImageErrors((prev) => ({ ...prev, [item.id]: true }))}
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Feather name="image" size={30} color="#999" />
                    </View>
                )}
                <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.cardPrice}>{formattedPrice}</Text>
            </TouchableOpacity>
        );
    };

    const renderListings = (listings) => (
        <View style={styles.gridContainer}>
            {listings.map((item) => (
                <View key={item.id} style={styles.gridItem}>
                    {renderItem({ item })}
                </View>
            ))}
        </View>
    );

    const renderSectionHeader = (title, isVisible, onToggle, count) => (
        <TouchableOpacity 
            style={[
                styles.sectionToggle,
                isVisible && styles.sectionToggleActive
            ]} 
            onPress={onToggle}
            activeOpacity={0.8}
        >
            <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.itemCount}>{count} items</Text>
            </View>
            <Feather 
                name={isVisible ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#666"
            />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0C2340" />
            </View>
        );
    }

    const noListings = currentListings.length === 0 && pastListings.length === 0;

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <Text style={styles.headerTitle}>My Listings</Text>
                <View style={styles.searchContainer}>
                    <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search your listings..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => setSearchQuery('')}
                            style={styles.clearButton}
                        >
                            <Feather name="x" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </SafeAreaView>

            <View style={styles.content}>
                {noListings ? (
                    <View style={styles.emptyState}>
                        <Feather name="package" size={50} color="#999" />
                        <Text style={styles.emptyStateText}>No listings yet</Text>
                        <TouchableOpacity 
                            style={styles.addListingButton}
                            onPress={() => navigation.navigate('AddProduct')}
                        >
                            <Text style={styles.addListingButtonText}>Create a Listing</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContainer}
                    >
                        {renderSectionHeader(
                            'Current Listings',
                            showCurrent,
                            () => setShowCurrent(!showCurrent),
                            filteredCurrentListings.length
                        )}
                        {showCurrent && renderListings(filteredCurrentListings)}
                        
                        {renderSectionHeader(
                            'Past Listings',
                            showPast,
                            () => setShowPast(!showPast),
                            filteredPastListings.length
                        )}
                        {showPast && renderListings(filteredPastListings)}
                    </ScrollView>
                )}
            </View>

            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <CustomNavBar />
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        paddingTop: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E8E8E8',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0C2340',
        textAlign: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    content: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContainer: {
        paddingTop: 12,
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    footer: {
        backgroundColor: '#0C2340',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 150,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    imagePlaceholder: {
        width: '100%',
        height: 150,
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    cardInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0C2340',
        marginTop: 8,
        marginHorizontal: 8,
    },
    cardDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        flex: 1,
    },
    cardPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2E8B57',
        marginTop: 4,
        marginBottom: 8,
        marginHorizontal: 8,
    },
    sectionToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 4,
        marginBottom: 12,
        borderRadius: 8,
    },
    sectionToggleActive: {
        backgroundColor: '#fff',
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0C2340',
        marginRight: 8,
    },
    itemCount: {
        fontSize: 14,
        color: '#666',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyStateText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        marginBottom: 24,
    },
    addListingButton: {
        backgroundColor: '#0C2340',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    addListingButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 4,
    },
    gridItem: {
        width: '48%', // slightly less than 50% to account for spacing
        marginBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 10,
        marginHorizontal: 16,
        marginBottom: 16,
        paddingHorizontal: 12,
        height: 42,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    searchIcon: {
        marginRight: 8,
        opacity: 0.6,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        height: '100%',
        paddingVertical: 8,
    },
    clearButton: {
        padding: 4,
        marginLeft: 4,
    },
});

export default MyListingsScreen;