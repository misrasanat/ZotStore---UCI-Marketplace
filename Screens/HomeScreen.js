import React from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView} from 'react-native';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';


let curr_items = [];

const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = React.useState([]);

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
        <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
            <View style={styles.topSection}>
                {/* Search Bar */}
                <TextInput
                    style={styles.searchBar}
                    placeholder="🔎 Search ZotStore"
                    placeholderTextColor="#000"
                />

                {/* Sell Button */}
                <TouchableOpacity style={styles.sellButton} onPress={() => navigation.navigate('AddProduct')}>
                    <Text style={styles.sellButtonText}>Sell Item</Text>
                </TouchableOpacity>

                {/* Listings Header */}
                <Text style={styles.listingHeader}>Listings:</Text>
            </View>

            
            <View style={styles.container2}>

                {/* Item Listings */}
                {items.length === 0 ? (
                    <Text style={styles.noListings}>No current Listings</Text>
                ) : (
                    <FlatList
                        data={items}
                        numColumns={2}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listingsContainer}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => {
                                    console.log('Card tapped:', item);
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
                        <TouchableOpacity style={styles.navItem}>
                            <Text style={styles.navText}>📬</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem}>
                            <Text style={styles.navText}>📦</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                            <Text style={styles.navText}>👤</Text>
                        </TouchableOpacity>
                    </View>
                
        </View>
        </SafeAreaView>
        


        
    );
};

export default HomeScreen;