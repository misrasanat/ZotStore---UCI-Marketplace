import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from '../ThemeContext';

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backIcon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  ratingSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  star: {
    fontSize: 40,
    color: colors.textSecondary,
  },
  starSelected: {
    color: '#ffd700',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
  },
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: colors.input,
    color: colors.text,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: colors.button,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    color: colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});

const LeaveReviewScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { userId, userName } = route.params;
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review comment.');
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert('Error', 'Review must be at least 10 characters long.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to leave a review.');
      return;
    }

    if (currentUser.uid === userId) {
      Alert.alert('Error', 'You cannot review yourself.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'reviews'), {
        reviewerId: currentUser.uid,
        reviewerName: currentUser.displayName || currentUser.email,
        reviewedUserId: userId,
        reviewedUserName: userName || userProfile?.name,
        rating: rating,
        comment: comment.trim(),
        timestamp: serverTimestamp(),
      });

      Alert.alert(
        'Success!',
        'Your review has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Text style={[styles.star, rating >= i && styles.starSelected]}>
            {rating >= i ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Leave a Review</Text>
          <Text style={styles.subtitle}>Share your experience with {userName || userProfile?.name}</Text>
        </View>

        {userProfile && (
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: userProfile.profilePic || 'https://i.pravatar.cc/150?img=12' }} 
              style={styles.avatar} 
            />
            <Text style={styles.userName}>{userProfile.name}</Text>
          </View>
        )}

        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0 ? `${rating} out of 5 stars` : 'Select a rating'}
          </Text>
        </View>

        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Share your experience with this user..."
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>
            {comment.length}/500 characters
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LeaveReviewScreen;
