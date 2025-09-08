import React, { useState, useEffect }  from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ScrollView, Modal, TextInput, Alert, KeyboardAvoidingView, Platform} from 'react-native';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../AuthContext';

const OtherUserProfileScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  const { user: currentUser, userProfile } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [reportExplanation, setReportExplanation] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const reportTypes = [
    { id: 'Harassment', label: 'Harassment' },
    { id: 'Scam', label: 'Scam/Fraud' },
    { id: 'Inappropriate', label: 'Inappropriate Content' },
    { id: 'Spam', label: 'Spam' },
    { id: 'Other', label: 'Other' }
  ];

  const handleReportSubmit = async () => {
    if (!selectedReportType || !reportExplanation.trim()) {
      Alert.alert('Error', 'Please select a report type and provide an explanation.');
      return;
    }
    if (reportExplanation.trim().length < 10) {
      Alert.alert('Error', 'Please provide a more detailed explanation (10+ characters).');
      return;
    }
    if (reportExplanation.trim().length > 500) {
      Alert.alert('Error', 'Explanation is too long. Please keep it under 500 characters.');
      return;
    }
    setIsSubmittingReport(true);
    try {
      const reportData = {
        reporterId: currentUser.uid,
        reporterName: userProfile.name,
        reportedUserId: userId,
        reportedUserName: profileUser.name,
        reportType: selectedReportType,
        explanation: reportExplanation.trim(),
        timestamp: new Date(),
        status: 'pending'
      };
      // Add report to Firestore
      await addDoc(collection(db, 'reports'), reportData);
      // Reset form
      setSelectedReportType('');
      setReportExplanation('');
      setReportModalVisible(false);
      Alert.alert(
        'Report Submitted',
        'Thank you for your report. We will review it and take appropriate action.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert(
        'Error',
        'Failed to submit report. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReportCancel = () => {
    setSelectedReportType('');
    setReportExplanation('');
    setReportModalVisible(false);
  };

  const fetchUserProfile = async () => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('Fetched user data:', userData);
        setProfileUser(userData);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const fetchUserListings = async () => {
    try {
      console.log('Fetching listings for user:', userId);
      const q = query(collection(db, 'listings'), where('userId', '==', userId), where('status', '==', 'active'));
      const querySnapshot = await getDocs(q);
      console.log('Found listings:', querySnapshot.size);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setListings(items);
    } catch (error) {
      console.error('Error loading user listings:', error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      // First, get total count of reviews
      const totalQuery = query(
        collection(db, 'reviews'), 
        where('reviewedUserId', '==', userId)
      );
      const totalSnapshot = await getDocs(totalQuery);
      setTotalReviews(totalSnapshot.size);

      // Then fetch limited reviews for display
      const displayQuery = query(
        collection(db, 'reviews'), 
        where('reviewedUserId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(displayQuery);
      const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(reviewsData);
      
      // Calculate average rating from all reviews
      if (totalSnapshot.size > 0) {
        const totalRating = totalSnapshot.docs.reduce((sum, doc) => sum + doc.data().rating, 0);
        setAverageRating(totalRating / totalSnapshot.size);
      } else {
        setAverageRating(0);
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  };

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserListings();
      fetchUserReviews();
    }
  }, [userId]);

  // Refresh reviews when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (userId) {
        fetchUserReviews();
      }
    }, [userId])
  );
  
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
      <SafeAreaView edges={['top']} style={styles.safeTop}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#0C2340" />
      </TouchableOpacity>
      </SafeAreaView>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Info */}
    <View style={styles.profileSection}>
        {user ? (
        <>
          <Image source={{ uri: profileUser.profilePic || 'https://i.pravatar.cc/150?img=12' }} style={styles.avatar} />
          <Text style={styles.name}>{profileUser.name}</Text>
          <Text style={styles.email}>{profileUser.email}</Text>
          <Text style={styles.joined}>Joined {new Date(profileUser.createdAt?.seconds * 1000).toLocaleDateString()}</Text>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>

    {/* Bio */}
    <View style={styles.bioBox}>
      {profileUser ? (
      <>
        <Text style={styles.bioHeader}>About</Text>
        <Text style={styles.bioText}>{profileUser.bio || 'No bio provided.'}</Text>
      </>
    ) : (
      <Text>Loading...</Text>
    )}
        
    </View>

    {/* Contact & Location (privacy-aware) */}
    {profileUser && (
      <View style={styles.contactBox}>
        <Text style={styles.sectionHeader}>Contact & Location</Text>
        {(() => {
          const privacy = profileUser?.settings?.privacy || {};
          const showPhone = privacy.showPhone === true;
          const locationDetail = privacy.locationDetail || 'off';

          // Phone
          const phoneRow = showPhone && profileUser.phone ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{profileUser.phone}</Text>
            </View>
          ) : null;

          // Location
          const isOnCampus = profileUser.locationType === 'on-campus';
          const campusLabelMap = {
            'middle-earth': 'Middle Earth',
            'mesa-court': 'Mesa Court',
          };
          let locationText = '';
          if (locationDetail === 'area') {
            if (isOnCampus) {
              locationText = campusLabelMap[profileUser.campusArea] || 'On Campus';
            } else if (profileUser.locationType === 'off-campus') {
              locationText = 'Off Campus';
            }
          } else if (locationDetail === 'precise') {
            if (isOnCampus) {
              const area = campusLabelMap[profileUser.campusArea] || 'On Campus';
              const building = profileUser.buildingName ? ` - ${profileUser.buildingName}` : '';
              locationText = `${area}${building}`;
            } else if (profileUser.locationType === 'off-campus') {
              locationText = profileUser.apartmentName ? `Off Campus - ${profileUser.apartmentName}` : 'Off Campus';
            }
          }
          const locationRow = locationDetail !== 'off' && locationText ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{locationText}</Text>
            </View>
          ) : null;

          if (!phoneRow && !locationRow) return null;
          return (
            <>
              {phoneRow}
              {locationRow}
            </>
          );
        })()}
      </View>
    )}

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
          onPress={() => navigation.navigate('Other User Listings', { userId, userName: profileUser?.name })}
        >
          <Text style={styles.actionText}>📦 View Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setReportModalVisible(true)}
        >
          <Text style={styles.reportText}>⚠️ Report</Text>
        </TouchableOpacity>
      </View>

      {/* Listings Preview */}
      <View style={styles.recentListingsSection}>
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

    {/* Reviews section */}
    <View style={styles.reviewsSection}>
        <View style={styles.reviewsHeaderRow}>
            <Text style={styles.sectionHeader2}>Reviews</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Leave Review', { userId, userName: profileUser?.name })}>
                <Text style={styles.leaveReview}>Leave a Review</Text>
            </TouchableOpacity>
        </View>
        
        {reviews.length > 0 ? (
          <>
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.starsDisplay}>
                {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
              </Text>
              <Text style={styles.totalReviews}>({totalReviews} reviews)</Text>
            </View>
            
            {reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <Text style={styles.reviewText}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)} "{review.comment}"
                </Text>
                <Text style={styles.reviewer}>— {review.reviewerName}</Text>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noReviewsCard}>
            <Text style={styles.noReviewsText}>No reviews yet</Text>
            <Text style={styles.noReviewsSubtext}>Be the first to review this user!</Text>
          </View>
        )}

        {reviews.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('All Reviews', { userId, userName: profileUser?.name })}>
            <Text style={styles.linkText}>See all reviews →</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>

    {/* Report Modal */}
    <Modal
      visible={reportModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleReportCancel}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Report User</Text>
            
            <Text style={styles.modalSubtitle}>Select report type:</Text>
            {reportTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.reportTypeOption}
                onPress={() => setSelectedReportType(type.id)}
              >
                <View style={styles.radioContainer}>
                  <View style={[
                    styles.radioButton,
                    selectedReportType === type.id && styles.radioButtonSelected
                  ]}>
                    {selectedReportType === type.id && <View style={styles.radioButtonInner} />}
                  </View>
                  <Text style={styles.reportTypeLabel}>{type.label}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {selectedReportType && (
              <>
                <Text style={styles.modalSubtitle}>Explain what happened:</Text>
                <TextInput
                  style={styles.explanationInput}
                  placeholder="Please provide details about the incident..."
                  value={reportExplanation}
                  onChangeText={setReportExplanation}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {reportExplanation.length}/500 characters
                </Text>
              </>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleReportCancel}
                disabled={isSubmittingReport}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedReportType || !reportExplanation.trim() || isSubmittingReport) && styles.submitButtonDisabled
                ]}
                onPress={handleReportSubmit}
                disabled={!selectedReportType || !reportExplanation.trim() || isSubmittingReport}
              >
                <Text style={styles.submitButtonText}>
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
  safeTop: {
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 10,
    marginLeft: 20,
    zIndex: 10,
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
    marginTop: 16,
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
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageRating: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  starsDisplay: {
    fontSize: 18,
    color: '#f5b823',
  },
  totalReviews: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  noReviewsCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#555',
  },
  contactBox: {
    marginTop: 16,
    paddingHorizontal: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    maxHeight: '80%',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  reportTypeOption: {
    marginVertical: 4,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#194a7a',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#194a7a',
  },
  reportTypeLabel: {
    fontSize: 16,
    color: '#333',
  },
  explanationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#194a7a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default OtherUserProfileScreen;