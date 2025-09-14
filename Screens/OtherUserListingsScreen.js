import React, { useState, useEffect }  from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView } from 'react-native';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../ThemeContext';

const OtherUserListingsScreen = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [listings, setListings] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchUserListings = async () => {
      try {
        const q = query(collection(db, 'listings'), where('userId', '==', userId), where('status', '==', 'active'));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setListings(items);
      } catch (error) {
        console.error('Error loading user listings:', error);
      }
    };

    if (userId) {
      fetchUserListings();
    }
  }, [userId]);

  const renderListing = ({ item }) => (
    <TouchableOpacity
      style={[styles.listingCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('View Listing', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={[styles.listingName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.listingPrice, { color: colors.price }]}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.screenWrapper, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{userName}'s Listings</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active listings</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={renderListing}
          numColumns={2}
          contentContainerStyle={[styles.listContainer, { backgroundColor: colors.background }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginLeft: -44,
  },
  headerRight: {
    width: 44,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  listingCard: {
    flex: 1,
    margin: 8,
    borderRadius: 12,
    padding: 8,
  },
  listingImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  listingInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  listingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  listingPrice: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default OtherUserListingsScreen; 