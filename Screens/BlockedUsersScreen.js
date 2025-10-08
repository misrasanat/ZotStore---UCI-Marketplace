import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';
import Feather from 'react-native-vector-icons/Feather';

const BlockedUsersScreen = ({ navigation }) => {
  const { user: currentUser } = useAuth();
  const { colors } = useTheme();
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingUsers, setUnblockingUsers] = useState(new Set());

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const fetchBlockedUsers = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const currentUserSnap = await getDoc(currentUserRef);
      
      if (currentUserSnap.exists()) {
        const userData = currentUserSnap.data();
        const blockedUserIds = userData.blockedUsers || [];
        
        // Fetch details for each blocked user
        const blockedUsersData = await Promise.all(
          blockedUserIds.map(async (userId) => {
            try {
              const userRef = doc(db, 'users', userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                return { id: userId, ...userSnap.data() };
              }
              return { id: userId, name: 'Unknown User' };
            } catch (error) {
              console.error('Error fetching blocked user:', error);
              return { id: userId, name: 'Unknown User' };
            }
          })
        );
        
        setBlockedUsers(blockedUsersData);
      }
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      Alert.alert('Error', 'Failed to load blocked users.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    if (unblockingUsers.has(userId)) return;
    
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            setUnblockingUsers(prev => new Set(prev).add(userId));
            
            try {
              const currentUserRef = doc(db, 'users', currentUser.uid);
              const otherUserRef = doc(db, 'users', userId);
              
              // Remove from both arrays
              await updateDoc(currentUserRef, {
                blockedUsers: arrayRemove(userId)
              });
              await updateDoc(otherUserRef, {
                blockedBy: arrayRemove(currentUser.uid)
              });
              
              // Remove from local state
              setBlockedUsers(prev => prev.filter(user => user.id !== userId));
              
              Alert.alert('Success', `${userName} has been unblocked.`);
            } catch (error) {
              console.error('Error unblocking user:', error);
              Alert.alert('Error', 'Failed to unblock user. Please try again.');
            } finally {
              setUnblockingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  const renderBlockedUser = ({ item }) => (
    <View style={[styles.userCard, { backgroundColor: colors.card }]}>
      {item.profilePic ? (
        <Image
          source={{ uri: item.profilePic }}
          style={styles.profileImage}
        />
      ) : (
        <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.surface }]}>
          <Feather name="user-check" size={30} color={colors.textSecondary} />
        </View>
      )}
      
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name || 'Unknown User'}</Text>
        {item.email && (
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.unblockButton, { backgroundColor: colors.primary }]}
        onPress={() => handleUnblockUser(item.id, item.name)}
        disabled={unblockingUsers.has(item.id)}
      >
        <Text style={[styles.unblockButtonText, { color: colors.textLight }]}>
          {unblockingUsers.has(item.id) ? 'Unblocking...' : 'Unblock'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Blocked Users</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading blocked users...</Text>
        </View>
      ) : blockedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="user-x" size={50} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Blocked Users</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            You haven't blocked anyone yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderBlockedUser}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BlockedUsersScreen;
