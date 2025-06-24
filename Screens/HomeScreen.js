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
                    <View style={styles.card}>
                        <Text style={styles.seller}>Seller</Text>
                        <View style={styles.imagePlaceholder} />
                        <Text style={styles.price}>{item.name} — ${item.price}</Text>
                    </View>
                    )}
                />
                )}
        </View>


        
    );
};

export default HomeScreen;