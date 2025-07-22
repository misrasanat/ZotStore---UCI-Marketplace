import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { getDoc } from 'firebase/firestore';




const ViewListingScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [sellerInfo, setSellerInfo] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const updatedTime = item.timestamp?.toDate
    ? formatDistanceToNow(item.timestamp.toDate(), { addSuffix: true })
    : 'just now';

  useEffect(() => {
    const fetchSellerProfile = async () => {
      if (!item.userId) return;

      try {
        const userRef = doc(db, 'users', item.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setSellerInfo(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching seller profile:', error);
      }
    };

    fetchSellerProfile();
  }, [item.userId]);

  useEffect(() => {
    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);
  const handleArchive = async () => {
    try {
      // example - customize as needed
      await updateDoc(doc(db, 'listings', item.id), {
        status: 'past'
      });
      alert('Listing has been archived.');
      navigation.goBack();
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing.');
    }
  };

  function getYearString(year) {
    if (!year) return '';
    if (year === '1') return '1st Year';
    if (year === '2') return '2nd Year';
    if (year === '3') return '3rd Year';
    if (year === '4') return '4th Year';
    return `${year} Year`;
  }

  function getLocationString(sellerInfo) {
    if (!sellerInfo) return '';
    if (sellerInfo.locationType === 'on-campus') {
      let area = '';
      if (sellerInfo.campusArea === 'middle-earth') area = 'Middle Earth';
      else if (sellerInfo.campusArea === 'mesa-court') area = 'Mesa Court';
      else area = sellerInfo.campusArea || '';
      return `${area}${sellerInfo.buildingName ? ' - ' + sellerInfo.buildingName : ''}`;
    } else if (sellerInfo.locationType === 'off-campus') {
      return `Off Campus${sellerInfo.apartmentName ? ' - ' + sellerInfo.apartmentName : ''}`;
    }
    return '';
  }

  return (
    <View style={styles.container}>
    <View style={styles.container2}>
      
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
      <View style={styles.labelRow}>
        <Text style={styles.sectionLabel}>About Listing</Text>
        {currentUser?.uid === item.userId && item.status === 'active' && (
          <>
          <TouchableOpacity onPress={() => handleArchive()}>
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
          </>
        )}
      </View> 
      <Text style={styles.desc}>{item.desc}</Text>


      {/* Seller Profile */}
      <View style={styles.sectionGroup}>
        <TouchableOpacity style={styles.profileCard} onPress={() => navigation.navigate('Other User', { userId: item.userId })}>
          <Image
            source={{
              uri: sellerInfo?.profilePic || 'https://i.pravatar.cc/150?img=12'
            }}
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            {sellerInfo ? (
              <>
                <Text style={styles.profileName}>{sellerInfo.name || 'Unknown Seller'}</Text>
    
                <Text style={styles.subtleText}>{sellerInfo.studentType || 'Student'} · { getYearString(sellerInfo.year) || 'Unknown Year'}</Text>
                {sellerInfo.major && (
                  <Text style={styles.subtleText}>{sellerInfo.major}</Text>
                )}
              </>
            ) : (
              <Text style={styles.subtleText}>Loading seller info...</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Location */}
      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{getLocationString(sellerInfo)}</Text>
      </View>
    </ScrollView>
    </View>
    
      {/* Floating Buttons */}
      <TouchableOpacity
        style={styles.messageButton}
        onPress={() => navigation.navigate('Chat Screen', { userId: item.userId })}
      >
        <Text style={styles.buttonText}>💬</Text>
      </TouchableOpacity>
      {currentUser?.uid === item.userId && (
        <>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('Edit Listing', { item })}
          >
            <Text style={styles.buttonText}>✏️</Text>
          </TouchableOpacity>
        </>
      )}
      
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
  },
  container2: {
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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  deleteText: {
    color: '#FFC72C',
    fontWeight: '600',
    fontSize: 28,
    padding: 4,
    paddingBottom: 8
    
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
    backgroundColor: '#0C2340',
    padding: 16,
    borderRadius: 50,
    elevation: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    backgroundColor: '#0C2340',
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
    
    padding: 12,
    paddingBottom: 15,
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
    backgroundColor: '#0C2340',
    borderTopWidth: 1,
    borderTopColor: '#1f2b3aff',
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