import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../ThemeContext';

const AllReviewsScreen = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const REVIEWS_PER_PAGE = 10;
  const { colors } = useTheme();

  const fetchReviews = async (isLoadMore = false) => {
    try {
      let q;
      if (isLoadMore && lastDoc) {
        q = query(
          collection(db, 'reviews'),
          where('reviewedUserId', '==', userId),
          orderBy('timestamp', 'desc'),
          startAfter(lastDoc),
          limit(REVIEWS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'reviews'),
          where('reviewedUserId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(REVIEWS_PER_PAGE)
        );
      }

      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (isLoadMore) {
        setReviews(prev => [...prev, ...reviewsData]);
      } else {
        setReviews(reviewsData);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(reviewsData.length === REVIEWS_PER_PAGE);

      // Calculate average rating and total count
      if (!isLoadMore) {
        const allReviewsQuery = query(
          collection(db, 'reviews'),
          where('reviewedUserId', '==', userId)
        );
        const allReviewsSnapshot = await getDocs(allReviewsQuery);
        const allReviews = allReviewsSnapshot.docs.map(doc => doc.data());
        
        if (allReviews.length > 0) {
          const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / allReviews.length);
          setTotalReviews(allReviews.length);
        } else {
          setAverageRating(0);
          setTotalReviews(0);
        }
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const loadMoreReviews = () => {
    if (hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchReviews(true);
    }
  };

  const renderReview = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.reviewHeader}>
        <Text style={styles.stars}>
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </Text>
        <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
          {item.timestamp?.toDate ? 
            item.timestamp.toDate().toLocaleDateString() : 
            'Recent'
          }
        </Text>
      </View>
      <Text style={[styles.reviewText, { color: colors.text }]}>"{item.comment}"</Text>
      <Text style={[styles.reviewer, { color: colors.textSecondary }]}>— {item.reviewerName}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={styles.ratingSummary}>
        <Text style={[styles.averageRating, { color: colors.text }]}>{averageRating.toFixed(1)}</Text>
        <Text style={styles.starsDisplay}>
          {'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}
        </Text>
        <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>({totalReviews} total reviews)</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>No more reviews</Text>
        </View>
      );
    }
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Loading more reviews...</Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={[styles.backIcon, { color: colors.primary }]}>←</Text>
      </TouchableOpacity>

      <View style={[styles.titleContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>All Reviews</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>for {userName}</Text>
      </View>

      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          onEndReached={loadMoreReviews}
          onEndReachedThreshold={0.1}
          contentContainerStyle={[styles.listContainer, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Reviews Yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>This user hasn't received any reviews yet.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backIcon: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  averageRating: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  starsDisplay: {
    fontSize: 20,
    color: '#f5b823',
  },
  totalReviews: {
    fontSize: 16,
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  reviewCard: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    fontSize: 16,
    color: '#f5b823',
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  reviewer: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AllReviewsScreen; 