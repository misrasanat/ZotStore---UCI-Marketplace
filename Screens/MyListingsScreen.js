import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView, } from 'react-native';

const mockListings = [
  {
    id: '1',
    name: 'Graphing Calculator',
    price: '65.00',
    desc: 'TI-84 Plus CE in great condition. Used for Math 2A.',
    image: 'https://i.imgur.com/z9fU4Zb.jpg',
  },
  {
    id: '2',
    name: 'Mini Fridge',
    price: '45.00',
    desc: 'Used for two quarters in the dorm. Very clean and quiet.',
    image: 'https://i.imgur.com/yWk9iGJ.jpg',
  },
  {
    id: '3',
    name: 'Textbooks Bundle',
    price: '30.00',
    desc: 'Includes Econ 20A, Physics 3A, and Stats 7. Some highlights.',
    image: 'https://i.imgur.com/HfJwNRF.jpg',
  },
];


const MyListingsScreen = ({ navigation }) => {
    const currentListings = [mockListings[0], mockListings[1]];
    const pastListings = [mockListings[2]];
    const [showCurrent, setShowCurrent] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const sections = [
        { title: 'Current Listings', data: showCurrent ? currentListings : [], key: 'current' },
        { title: 'Past Listings', data: showPast ? pastListings : [], key: 'past' },
    ];

    const renderItem = ({ item }) => {
        const hasError = imageErrors[item.id];

        return (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('View Listing', { item })}>
            {!hasError && item.image ? (
                <Image
                source={{ uri: item.image }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() =>
                    setImageErrors((prev) => ({ ...prev, [item.id]: true }))
                }
                />
            ) : (
                <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>N/A</Text>
                </View>
            )}
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
                <Text style={styles.cardPrice}>${item.price}</Text>
            </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
        <FlatList
            data={sections}
            keyExtractor={(section) => section.key}
            renderItem={({ item }) => (
                <>
                <TouchableOpacity onPress={() => {
                    if (item.key === 'current') setShowCurrent(!showCurrent);
                    if (item.key === 'past') setShowPast(!showPast);
                }} style={styles.sectionToggle}>
                    <Text style={styles.sectionTitle}>
                    {item.title} {(item.key === 'current' ? showCurrent : showPast) ? '▲' : '▼'}
                    </Text>
                </TouchableOpacity>
                {(item.key === 'current' ? showCurrent : showPast) &&
                    item.data.map((listing) => renderItem({ item: listing }))
                }
                </>
            )}
            ListHeaderComponent={<Text style={styles.header}>My Listings</Text>}
            contentContainerStyle={{ paddingBottom: 100 }}
        />

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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 40 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
},
placeholderText: {
    color: '#666',
    fontSize: 16,
},
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600' },
  cardDesc: { fontSize: 14, color: '#555', marginTop: 4 },
  cardPrice: { fontSize: 16, fontWeight: 'bold', color: '#2e8b57', marginTop: 6 },
  scrollContent: {
    paddingBottom: '40%', // room for nav bar and floating buttons
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    backgroundColor: '#fdfff5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 26,
        color: '#444',
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionToggle: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#222',
    },
});

export default MyListingsScreen;