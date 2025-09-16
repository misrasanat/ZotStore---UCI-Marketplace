import React, {useEffect, useState} from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../AuthContext';
import Modal from 'react-native-modal';
import { useTheme } from '../ThemeContext';

const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [filterVisible, setFilterVisible] = useState(false);
    const { userProfile } = useAuth();
    const { colors } = useTheme();
    const isUCIVerified = userProfile?.email?.toLowerCase().endsWith('@uci.edu') && userProfile?.isVerified;

    const categories = [
        { label: 'All Categories', value: null },
        { label: 'Electronics', value: 'electronics' },
        { label: 'Books', value: 'books' },
        { label: 'Accessories', value: 'accessories' }, // Changed from clothing
        { label: 'Furniture', value: 'furniture' },
        { label: 'Sports Equipment', value: 'sports' },
        { label: 'Toys & Games', value: 'toys' },
        { label: 'Home & Kitchen', value: 'home' },
        { label: 'Beauty & Personal Care', value: 'beauty' },
        { label: 'Pet Supplies', value: 'pets' },
        { label: 'Art & Crafts', value: 'art' },
        { label: 'Other', value: 'other' }
    ];
    
    // Filter items based on search query and selected categories
    const filteredItems = items.filter((item) => {
        const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(item.category);
        return matchesSearch && matchesCategory;
    });

    React.useEffect(() => {
        const q = query(
            collection(db, 'listings'),
            where('status', '==', 'active'), 
            orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            }));
            setItems(fetched);
        });

        return () => unsubscribe();
    }, []);

    const handleCategorySelect = (category) => {
        setSelectedCategories(prev => {
            if (category === null) {
                return []; // Clear all categories
            }
            if (prev.includes(category)) {
                return prev.filter(cat => cat !== category); // Remove if already selected
            }
            return [...prev, category]; // Add new category
        });
        setFilterVisible(false);
    };

    const clearFilter = () => {
        setSelectedCategories([]);
    };

    return (
        <>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.topSection, { backgroundColor: colors.background }]}>
                    {/* Search Bar and Profile */}
                    <View style={styles.searchBarContainer}>
                    <View style={[styles.searchContainer, { backgroundColor: colors.searchBackground, borderColor: colors.searchBorder }]}>
                        <Feather name="search" size={20} color={colors.text} style={styles.searchIcon} />
                        <TextInput
                        style={[styles.searchBar, { color: colors.text }]}
                        placeholder="Search ZotStore"
                        placeholderTextColor={colors.placeholder}
                        value={searchQuery}
                        onChangeText={text => setSearchQuery(text)}
                        />
                        <TouchableOpacity onPress={() => setFilterVisible(true)}>
                        <Feather name="filter" size={20} color={colors.text} style={styles.filterIcon} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity 
                        style={[styles.profileButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        {userProfile?.profilePic ? (
                        <Image 
                            source={{ uri: userProfile.profilePic }} 
                            style={{ width: '100%', height: '100%', borderRadius: 22 }}
                        />
                        ) : (
                        <Feather name="user" size={24} color={colors.textLight} />
                        )}
                    </TouchableOpacity>
                    </View>

                    {/* Filter Tags */}
                    {selectedCategories.length > 0 && (
                    <View style={styles.filterSection}>
                        <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.filterTagsContainer}
                        >
                        {selectedCategories.map(cat => (
                            <View key={cat} style={styles.filterTag}>
                            <Text style={[styles.filterTagText, { color: colors.text }]}>
                                {categories.find(c => c.value === cat)?.label}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => handleCategorySelect(cat)}
                                style={styles.filterTagClose}
                            >
                                <Feather name="x" size={16} color={colors.placeholder} />
                            </TouchableOpacity>
                            </View>
                        ))}
                        </ScrollView>
                        <View style={[styles.filterDivider, { backgroundColor: colors.divider }]} />
                        <TouchableOpacity 
                        onPress={clearFilter}
                        style={styles.clearAllButton}
                        >
                        <Text style={[styles.clearAllText, { color: colors.text }]}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                    )}
                </View>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </SafeAreaView>
            
            

                <View style={{ flex: 1}}>
                <View style={[styles.container2, { backgroundColor: colors.background }]}>

                    {/* Item Listings */}
                    {items.length === 0 ? (
                        <Text style={[styles.noListings, { color: colors.noListings }]}>No current Listings</Text>
                    ) : filteredItems.length === 0 ? (
                        <Text style={styles.noListings}>
                            {selectedCategories.length > 0 
                                ? `No items found in ${selectedCategories.map(cat => categories.find(c => c.value === cat)?.label).join(', ')}`
                                : 'No items match your search'}
                        </Text>
                    ) : (
                        <FlatList
                            data={filteredItems}
                            showsVerticalScrollIndicator={false}
                            numColumns={2}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{
                                paddingBottom: 60,           // gives space for nav bar
                                flexGrow: 1,                 // stretches vertically
                                justifyContent: 'flex-start' // prevents centering when few items
                            }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.card, { backgroundColor: colors.cardBackground }]}
                                    onPress={() => {
                                        navigation.navigate('View Listing', { item });
                                        // navigation.navigate('ItemDetail', { item }); // optional: hook to details screen
                                    }}
                                    activeOpacity={0.85}
                                >
                                    {/* Top fixed section */}
                                    <View style={styles.cardTop}>
                                    {/*<Text style={styles.seller}>Seller</Text>*/}

                                    {item.image ? (<Image
                                        source={{ uri: item.image }}
                                        style={styles.cardImage}
                                        resizeMode="cover"
                                        />
                                    ) : (
                                        <View style={[styles.imagePlaceholder, { backgroundColor: colors.surface }]}>
                                            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>N/A</Text>
                                        </View>
                                            
                                    )}
                                    </View>

                                    {/* Bottom flexible section */}
                                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[styles.price, { color: colors.price }]}>${item.price}</Text>
                                </TouchableOpacity> 
                                )}
                        />
                        )}
                    </View>
{/* Only show sell button for UCI students */}
                    {isUCIVerified && (
                        <View style={styles.floatingActionRow}>
                            <TouchableOpacity
                                style={[styles.messageButton, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('AddProduct')}
                            >
                                <View style={styles.sellButtonContainer}>
                                    <Feather name="plus" size={20} style={{color: colors.textLight, backgroundColor: colors.primary}} />
                                    <Text style={[styles.sellButtonText, { color: colors.textLight }]}>Sell Item</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    <View style={styles.floatingActionRow}>
                        <TouchableOpacity
                        style={[styles.messageButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('AddProduct')}
                        >
                        <View style={styles.sellButtonContainer}>
                            <Feather name="plus" size={20} color="#fff" />
                            <Text style={styles.sellButtonText}>Sell Item</Text>
                        </View>
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView  edges={['bottom']} style={[styles.safeContainer2, { backgroundColor: colors.primary2}]}>
                        <CustomNavBar />
                    </SafeAreaView>
                    </View>
            </View>

            <Modal
                isVisible={filterVisible}
                onBackdropPress={() => setFilterVisible(false)}
                style={styles.modal}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Select Categories</Text>
                    <ScrollView>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.value || 'all'}
                                style={[
                                    styles.categoryItem,
                                    selectedCategories.includes(category.value) && 
                                    styles.categoryItemSelected
                                ]}
                                onPress={() => handleCategorySelect(category.value)}
                            >
                                <Text style={[
                                    styles.categoryText,
                                    selectedCategories.includes(category.value) && 
                                    styles.categoryTextSelected
                                ]}>
                                    {category.label}
                                </Text>
                                {selectedCategories.includes(category.value) && (
                                    <Feather name="check" size={20} color="#0C2340" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </Modal>
            
        </>
    );
};

// Add these styles to your existing StyleSheet
const extraStyles = {
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
        color: '#0C2340',
        textAlign: 'center',
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginVertical: 4,
    },
    categoryItemSelected: {
        backgroundColor: '#F0F0F0',
    },
    categoryText: {
        fontSize: 16,
        color: '#333',
    },
    categoryTextSelected: {
        color: '#0C2340',
        fontWeight: '600',
    },
    filterTagsContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 8,
    },
    filterTagClose: {
        marginLeft: 4,
    },
    clearAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        justifyContent: 'center',
    },
    clearAllText: {
        color: '#0C2340',
        fontSize: 14,
        fontWeight: '500',
    },
    filterSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    filterDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },
};

export default HomeScreen;