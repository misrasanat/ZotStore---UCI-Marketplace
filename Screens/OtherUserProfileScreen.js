import React from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView} from 'react-native';

const user = {
  name: 'Peter Anteater',
  email: 'panteate@uci.edu',
  bio: '3rd year CS major. I usually sell my dorm stuff and textbooks here.',
  avatar: 'https://i.pravatar.cc/150?img=12',
  joined: 'September 2023',
};

const mockListings = [
  {
    id: '1',
    name: 'Dorm Mini Fridge',
    price: '50.00',
    image: 'https://i.imgur.com/yWk9iGJ.jpg',
  },
  {
    id: '2',
    name: 'Textbooks Bundle',
    price: '30.00',
    image: 'https://i.imgur.com/HfJwNRF.jpg',
  },
  {
    id: '3',
    name: 'Desk Lamp',
    price: '15.00',
    image: 'https://i.imgur.com/z9fU4Zb.jpg',
  },
];

const OtherUserProfileScreen = ({ navigation }) => {
  const renderListing = ({ item }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate('View Listing', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.listingImage} />
      <View style={styles.listingInfo}>
        <Text style={styles.listingName}>{item.name}</Text>
        <Text style={styles.listingPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screenWrapper}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Info */}
    <View style={styles.profileSection}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.joined}>Joined {user.joined}</Text>
    </View>

      {/* Bio */}
      <View style={styles.bioBox}>
        <Text style={styles.bioHeader}>About</Text>
    <Text style={styles.bioText}>{user.bio}</Text>
    </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat', { user })}
        >
          <Text style={styles.actionText}>📩 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('My Listings')}
        >
          <Text style={styles.actionText}>📦 View Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => alert('Reported (demo only)')}
        >
          <Text style={styles.reportText}>⚠️ Report</Text>
        </TouchableOpacity>
      </View>

      {/* Listings Preview */}
      <Text style={styles.sectionHeader}>Recent Listings</Text>
      <FlatList
        data={mockListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingBottom: 24 }}
      />

    <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionHeader2}>Reviews</Text>
            <TouchableOpacity onPress={() => alert('Leave review coming soon')}>
                <Text style={styles.leaveReview}>Leave a Review</Text>
            </TouchableOpacity>
        </View>
        
        <View style={styles.reviewCard}>
            <Text style={styles.reviewText}>⭐️⭐️⭐️⭐️⭐️ “Quick replies, super friendly and the fridge was spotless!”</Text>
            <Text style={styles.reviewer}>— Alex T., 2nd Year</Text>
        </View>

        <View style={styles.reviewCard}>
            <Text style={styles.reviewText}>⭐️⭐️⭐️⭐️ “Met on time near Langson, would buy again.”</Text>
            <Text style={styles.reviewer}>— Janelle M., 4th Year</Text>
        </View>

        <TouchableOpacity onPress={() => alert('All reviews coming soon')}>
            <Text style={styles.linkText}>See all reviews →</Text>
        </TouchableOpacity>
    </View>
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,
  backgroundColor: '#fff',
  position: 'relative',
},
screenWrapper: {
  flex: 1,
  position: 'relative',
},

backButton: {
  position: 'absolute',
  top: 0,
  left: 0,
  zIndex: 10,
  backgroundColor: '#fff',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
},

backIcon: {
  color: '#194a7a',
  fontSize: 40,
  fontWeight: 'bold',
},
bioBox: {
  marginTop: 24,
  paddingHorizontal: 24,
},

bioHeader: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1a1a1a',
  marginBottom: 6,
},

bioText: {
  fontSize: 15,
  color: '#333',
  lineHeight: 22,
  letterSpacing: 0.3,
},
  profileSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  joined: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#194a7a',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: '#fff',
    borderColor: '#d33',
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  reportText: {
    color: '#d33',
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginLeft: 16,
    marginBottom: 12,
  },
  sectionHeader2: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginLeft: 6,
    marginBottom: 12,
  },
  listingCard: {
    marginRight: 14,
    width: 140,
  },
  listingImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  listingInfo: {
    marginTop: 6,
  },
  listingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  listingPrice: {
    fontSize: 14,
    color: '#2e8b57',
    marginTop: 2,
  },
  reviewsSection: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
},

reviewCard: {
  backgroundColor: '#f5f5f5',
  padding: 12,
  borderRadius: 10,
  marginBottom: 12,
},

reviewText: {
  fontSize: 15,
  lineHeight: 20,
  color: '#222',
},

reviewer: {
  fontSize: 13,
  color: '#555',
  marginTop: 6,
  fontStyle: 'italic',
},

linkText: {
  fontSize: 14,
  fontWeight: '600',
  color: '#194a7a',
  marginTop: 8,
},
reviewsHeaderRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
},

leaveReview: {
  fontSize: 15,
  color: '#194a7a',
  fontWeight: '600',
},
});

export default OtherUserProfileScreen;