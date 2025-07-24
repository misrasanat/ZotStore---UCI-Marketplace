import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

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
      await updateDoc(doc(db, 'listings', item.id), {
        status: 'past'
      });
      navigation.goBack();
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing.');
    }
  };

  const formattedPrice = parseFloat(item.price).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#0C2340" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>View Listing</Text>
          <View style={styles.headerRight}>
            {currentUser?.uid === item.userId && item.status === 'active' && (
              <View style={styles.headerActions}>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Edit Listing', { item })}
                  style={styles.headerButton}
                >
                  <Icon name="edit-2" size={20} color="#0C2340" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleArchive}
                  style={styles.headerButton}
                >
                  <Icon name="trash-2" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.content}
      >
        {/* Product Image */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Icon name="image" size={40} color="#999" />
            <Text style={styles.placeholderText}>No Image Available</Text>
          </View>
        )}

        <View style={styles.detailsContainer}>
          {/* Price and Title Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{formattedPrice}</Text>
            <Text style={styles.updatedAt}>{updatedTime}</Text>
          </View>
          
          <Text style={styles.title}>{item.name}</Text>

          {/* Description Section */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>

          {/* Seller Section */}
          <View style={styles.sellerSection}>
            <Text style={styles.sectionLabel}>Seller Information</Text>
            <TouchableOpacity 
              style={styles.profileCard} 
              onPress={() => navigation.navigate('Other User', { userId: item.userId })}
              activeOpacity={0.7}
            >
              <Image
                source={{
                  uri: sellerInfo?.profilePic || 'https://i.pravatar.cc/150?img=12'
                }}
                style={styles.profileImage}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{sellerInfo?.name || 'Unknown Seller'}</Text>
                <Text style={styles.profileDetails}>
                  {sellerInfo?.studentType || 'Student'} · {sellerInfo?.year || 'Unknown Year'}
                </Text>
                {sellerInfo?.major && (
                  <Text style={styles.profileMajor}>{sellerInfo.major}</Text>
                )}
              </View>
              <Icon name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Location Section */}
          <View style={styles.locationSection}>
            <Text style={styles.sectionLabel}>Location</Text>
            <View style={styles.locationCard}>
              <Icon name="map-pin" size={20} color="#2e8b57" />
              <Text style={styles.locationText}>Middle Earth — Balin</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Message Button */}
      {currentUser?.uid !== item.userId && (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          <TouchableOpacity
            style={styles.messageButton}
            onPress={() => navigation.navigate('Chat Screen', { userId: item.userId })}
            activeOpacity={0.7}
          >
            <Icon name="message-square" size={20} color="#fff" style={styles.messageIcon} />
            <Text style={styles.messageButtonText}>Message Seller</Text>
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0C2340',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerRight: {
    minWidth: 72,
    alignItems: 'flex-end',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 6,
    marginLeft: 8,
  },
  archiveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 300,
    backgroundColor: '#F8F9FA',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#999',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2e8b57',
  },
  updatedAt: {
    fontSize: 14,
    color: '#999',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0C2340',
    marginBottom: 24,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  desc: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  sellerSection: {
    marginBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0C2340',
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  profileMajor: {
    fontSize: 14,
    color: '#666',
  },
  locationSection: {
    marginBottom: 24,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2e8b57',
    marginLeft: 12,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  messageButton: {
    backgroundColor: '#0C2340',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  messageIcon: {
    marginRight: 8,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewListingScreen;