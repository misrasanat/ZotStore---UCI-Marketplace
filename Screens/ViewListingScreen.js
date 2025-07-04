import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

const ViewListingScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const updatedTime = item.timestamp?.toDate
    ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })
    : 'just now';

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* Product Image */}
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No Image Available</Text>
        </View>
      )}

      {/* Product Info */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.updatedContainer}>
          <Text style={styles.updatedAt}>Updated: {updatedTime}</Text>
        </View>
      </View>

      <Text style={styles.price}>${item.price}</Text>
      <Text style={styles.sectionLabel}>About Listing</Text>
      <Text style={styles.desc}>{item.desc}</Text>


      {/* Seller Profile */}
      <View style={styles.sectionGroup}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.profileCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.profileName}>Peter Anteater</Text>
            <Text style={styles.subtleText}>Member Since 03/25</Text>
            <Text style={styles.subtleText}>Undergraduate · 3rd Year</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.divider} />
      </View>

      {/* Location */}
      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>Middle Earth — Balin</Text>
      </View>
    </ScrollView>
      {/* Floating Buttons */}
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => alert("Message feature coming soon!")}
      >
        <Text style={styles.buttonText}>💬</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('Edit Listing', { item })}
      >
        <Text style={styles.buttonText}>✏️</Text>
      </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'flex-start',
    flexWrap: 'wrap',
  },

  updatedContainer: {
    flexShrink: 1,
    maxWidth: '40%',
    alignItems: 'flex-end',
    paddingTop: '2%'
  },

  updatedAt: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '400',
    marginBottom: 4,
    color: '#1a1a1a',
    flexShrink: 1,
    maxWidth: '60%',
    alignItems: 'flex-end',

  },
  price: {
    fontSize: 25,
    fontWeight: '700',
    color: '#2e8b57',
    marginBottom: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 16,
    color: '#222',
    lineHeight: 22,
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 6,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  scrollContent: {
    paddingBottom: '40%', // room for nav bar and floating buttons
  },
  messageButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    backgroundColor: '#0064a4',
    padding: 16,
    borderRadius: 50,
    elevation: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    backgroundColor: '#0064a4',
    padding: 16,
    borderRadius: 50,
    elevation: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    backgroundColor: '#f4f6f9',
    padding: 12,
    borderRadius: 10,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtleText: {
    fontSize: 14,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e8b57',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: '#bbb', // Slightly bolder for contrast
    width: '100%',
    alignSelf: 'center',
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
});

export default ViewListingScreen;