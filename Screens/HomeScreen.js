import React, {useEffect, useState} from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';


const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const { userProfile } = useAuth();
    const { colors } = useTheme();
    
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
    return (
        
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
                
                

                {/* <View style={styles.listingsRow}>
                    <Text style={styles.listingsHeader}>Listings:</Text>

                    <TouchableOpacity style={styles.sellButton} onPress={() => navigation.navigate('AddProduct')}>
                        <Text style={styles.sellButtonText}>Sell Item</Text>
                    </TouchableOpacity>
                </View> */}
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </SafeAreaView>
            
            

                <View style={{ flex: 1}}>
                <View style={[styles.container2, { backgroundColor: colors.background }]}>

                    {/* Item Listings */}
                    {items.length === 0 ? (
                        <Text style={[styles.noListings, { color: colors.noListings }]}>No current Listings</Text>
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
                    <View style={styles.floatingActionRow}>
                        <TouchableOpacity
                        style={[styles.messageButton, { backgroundColor: colors.primary }]}
                        onPress={() => navigation.navigate('AddProduct')}
                        >
                        <View style={styles.sellButtonContainer}>
                            <Feather name="plus" size={20} color={colors.textLight} />
                            <Text style={[styles.sellButtonText, { color: colors.textLight }]}>Sell Item</Text>
                        </View>
                        </TouchableOpacity>
                    </View>
                    <SafeAreaView  edges={['bottom']} style={[styles.safeContainer2, { backgroundColor: colors.primary }]}>
                        <CustomNavBar />
                    </SafeAreaView>
                    </View>
            
            </View>
            


        
    );
};

export default HomeScreen;