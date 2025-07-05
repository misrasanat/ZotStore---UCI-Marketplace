import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const dummyListings = [
  {
    id: '1',
    title: 'UCI Hoodie',
    price: 25,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '2',
    title: 'Textbook: Calculus',
    price: 60,
    status: 'Sold',
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: '3',
    title: 'Bike',
    price: 120,
    status: 'Available',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  },
];

const MyListingsScreen = () => {
  //const [listings, setListings] = useState([]);
  const [listings] = useState(dummyListings);
  const navigation = useNavigation();

//   useEffect(() => {
//     const fetchListings = async () => {
//       const auth = getAuth();
//       const db = getFirestore();
//       const user = auth.currentUser;
//       if (!user) return;

//       const q = query(
//         collection(db, 'products'),
//         where('ownerId', '==', user.uid)
//       );
//       const querySnapshot = await getDocs(q);
//       const items = [];
//       querySnapshot.forEach((doc) => {
//         items.push({ id: doc.id, ...doc.data() });
//       });
//       setListings(items);
//     };

//     fetchListings();
//   }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('View Listing', { listingId: item.id })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={styles.status}>{item.status || 'Available'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Listings</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No listings found.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  itemContainer: { flexDirection: 'row', marginBottom: 16, alignItems: 'center' },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold' },
  price: { fontSize: 16, color: '#888' },
  status: { fontSize: 14, color: '#4caf50' },
});

export default MyListingsScreen; 