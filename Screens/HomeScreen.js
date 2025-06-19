import React from 'react';
import styles from './HomeScreen.styles';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, FlatList, SafeAreaView} from 'react-native';

const HomeScreen = () => {
    return (

        <View style={styles.container}>
            {/* Search Bar */}
            <TextInput
                style={styles.searchBar}
                placeholder="Search"
                placeholderTextColor="#888"
            />

            {/* Sell Button */}
            <TouchableOpacity style={styles.sellButton}>
                <Text style={styles.sellButtonText}>Sell Item</Text>
            </TouchableOpacity>

            {/* Listings Header */}
            <Text style={styles.listingHeader}>Listings:</Text>

            
            

            {/* Item Listings */}
            <FlatList
                data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                numColumns={2}
                keyExtractor={(item, index) => index.toString()}
                style={{flex: 1}}
                contentContainerStyle={styles.listingsContainer}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                    <Text style={styles.seller}>Seller</Text>
                    <View style={styles.imagePlaceholder} />    
                    <Text style={styles.price}>ITEM $20</Text>
                    </View>
                )}
            />
        </View>


        
    );
};

export default HomeScreen;