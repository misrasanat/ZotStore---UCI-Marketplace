import React, { useState, useEffect }  from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView} from 'react-native';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const OtherUserProfileScreen = ({ navigation, route }) => {

  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data());
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

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
      fetchUserProfile();
      fetchUserListings();
    }
  }, [userId]);
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
        {user ? (
        <>
          <Image source={{ uri: user.profilePic || 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.joined}>Joined {new Date(user.createdAt?.seconds * 1000).toLocaleDateString()}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>

    

    {/* Bio */}
    <View style={styles.bioBox}>
      {user ? (
      <>
        <Text style={styles.bioHeader}>About</Text>
        <Text style={styles.bioText}>{user.bio || 'No bio provided.'}</Text>
      </>
    ) : (
      <Text>Loading...</Text>
    )}
        
    </View>

      

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Chat Screen', { userId })}
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

      <View style={styles.recentListingsSection}>
      {/* Listings Preview */}
      <Text style={styles.sectionHeader}>Recent Listings</Text>
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingBottom: 4 }}
      />
      </View>

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
  container: {  
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
  paddingTop: 15,
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
  recentListingsSection: {
    paddingBottom: 0,
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
    paddingTop: 10,
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