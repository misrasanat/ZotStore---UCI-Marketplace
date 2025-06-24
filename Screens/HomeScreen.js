import React from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView} from 'react-native';

let curr_items = [];

const HomeScreen = ({ navigation, route }) => {
    const [items, setItems] = React.useState([]);

    React.useEffect(() => {
        if (route.params?.newItem) {
            curr_items.push(route.params.newItem); // mutate global-ish store
            setItems([...curr_items]); // update state to reflect it
        }
    }, [route.params?.newItem]);
    return (

        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor="#888"
            />

            {/* Sell Button */}
            <TouchableOpacity style={styles.sellButton} onPress={() => navigation.navigate('AddProduct')}>
                <Text style={styles.sellButtonText}>Sell Item</Text>
            </TouchableOpacity>

            {/* Listings Header */}
            <Text style={styles.listingHeader}>Listings:</Text>

            
            

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
                            <Text style={styles.seller}>Seller</Text>

                            {item.image ? (<Image
                                source={{ uri: item.image }}
                                style={styles.cardImage}
                                resizeMode="cover"
                                />
                            ) : (
                                <View style={styles.imagePlaceholder} />
                            )}
                            </View>

                            {/* Bottom flexible section */}
                            <Text style={styles.price}> {item.name} — ${item.price} </Text>
                        </TouchableOpacity> 
                        )}
                />
                )}
        </View>


        
    );
};

export default HomeScreen;