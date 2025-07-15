import React, {useEffect, useState} from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';


const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = React.useState([]);
    const [searchQuery, setSearchQuery] = React.useState('');
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    React.useEffect(() => {
        const q = query(collection(db, 'listings'), orderBy('timestamp', 'desc'));
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
        
        <View style={styles.container}>
            <SafeAreaView style={styles.safeContainer}>
            <View style={styles.topSection}>
                {/* Search Bar */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="🔎 Search ZotStore"
                    placeholderTextColor="#000"
                    value={searchQuery}
                    onChangeText={text => setSearchQuery(text)}
                />

                <View style={styles.listingsRow}>
                    <Text style={styles.listingsHeader}>Listings:</Text>

                    <TouchableOpacity style={styles.sellButton} onPress={() => navigation.navigate('AddProduct')}>
                        <Text style={styles.sellButtonText}>Sell Item</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.divider} />
            </SafeAreaView>
            
            

                <View style={{ flex: 1}}>
                <View style={styles.container2}>

                    {/* Item Listings */}
                    {items.length === 0 ? (
                        <Text style={styles.noListings}>No current Listings</Text>
                    ) : (
                        <FlatList
                            data={filteredItems}
                            numColumns={2}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{
                                paddingBottom: 60,           // gives space for nav bar
                                flexGrow: 1,                 // stretches vertically
                                justifyContent: 'flex-start' // prevents centering when few items
                            }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.card}
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
                                        <View style={styles.imagePlaceholder}>
                                            <Text style={styles.placeholderText}>N/A</Text>
                                        </View>
                                            
                                    )}
                                    </View>

                                    {/* Bottom flexible section */}
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.price}>${item.price}</Text>
                                </TouchableOpacity> 
                                )}
                        />
                        )}
                    </View>
                        <View style={styles.navBar}>
                            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
                                <Text style={styles.navText}>🏠</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Inbox Screen')}>
                                <Text style={styles.navText}>📬</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('My Listings')}>
                                <Text style={styles.navText}>📦</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                                <Text style={styles.navText}>👤</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
            
            </View>
            


        
    );
};

export default HomeScreen;