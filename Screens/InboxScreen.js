import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, serverTimestamp, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAuth } from '../AuthContext';
import { formatRelative } from 'date-fns';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useUnread } from '../UnreadContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme } from '../ThemeContext';

const formatMessageTimestamp = (timestamp) => {
  if (!timestamp) return 'now';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    // If it's today, show only time
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // If it's yesterday, show "Yesterday"
    if (diffInDays === 1) {
      return 'Yesterday';
    }
    
    // If it's within the last 7 days, show the day name
    if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    
    // If it's older than 7 days, show the date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (error) {
    console.log('Error formatting timestamp:', error);
    return 'now';
  }
};

const isNewMessage = (timestamp) => {
  if (!timestamp) return false;
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date > new Date(Date.now() - 24 * 60 * 60 * 1000);
  } catch (error) {
    console.log('Error checking if message is new:', error);
    return false;
  }
};

const InboxScreen = ({ navigation }) => {
  const [chats, setChats] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { unreadCount, refreshUnreadStatus } = useUnread();
  const { colors } = useTheme();
  const { isGuest } = useAuth();

  // Redirect guests immediately
  React.useEffect(() => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode',
        'Please create an account to access messages.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [isGuest]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.card, 
        { backgroundColor: colors.card },
        item.unreadCount > 0 && { backgroundColor: colors.surface }
      ]}
      onPress={async () => {
        const auth = getAuth();
        const authUser = auth.currentUser;
        const chatRef = doc(db, 'chats', item.id);
        await updateDoc(chatRef, {
          [`unreadCount.${authUser.uid}`]: 0
        });
        refreshUnreadStatus();
        navigation.navigate('Chat Screen', { userId: item.otherUserId });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.otherUser?.profilePic ? (
          <Image source={{ uri: item.otherUser.profilePic }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.surface }]}>
            <Feather name="user-check" size={24} color={colors.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[
            styles.username,
            { color: colors.text },
            (item.unreadCount?.[currentUser?.uid] || 0) > 0 && { fontWeight: 'bold', fontSize: 17 }
          ]} numberOfLines={1}>{item.otherUser?.name || 'Unknown User'}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>
            {formatMessageTimestamp(item.lastMessage?.timestamp)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.message,
              { color: colors.textSecondary },
              (item.unreadCount?.[currentUser?.uid] || 0) > 0 && { fontWeight: '600', color: colors.text }
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage?.text || 'No messages yet'}
          </Text>
          {(item.unreadCount?.[currentUser?.uid] || 0) > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.textLight }]}>
                {item.unreadCount[currentUser.uid]}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!currentUser?.uid || isGuest) return; // Skip for guests
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          const blocked = userData.blockedUsers || [];
          const blockedBy = userData.blockedBy || [];
          // Filter out any undefined/null values
          setBlockedUsers([...blocked, ...blockedBy].filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      }
    };

    fetchBlockedUsers();
  }, [currentUser?.uid, isGuest]);

  useEffect(() => {
    if (!currentUser || isGuest) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'chats'), orderBy('lastMessage.timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      setLoading(true);
      const chatList = [];
      
      for (const docSnap of snapshot.docs) {
        const chatData = docSnap.data();
        if (!chatData.participants || !chatData.participants.includes(currentUser.uid)) continue;
        
        const otherUserId = chatData.participants.find(id => id !== currentUser.uid);
        
        // Skip if user is blocked - add null check
        if (!otherUserId || blockedUsers.includes(otherUserId)) continue;
        
        try {
          const otherUserRef = doc(db, 'users', otherUserId);
          const otherUserSnap = await getDoc(otherUserRef);
          
          let otherUserData = { name: 'Unknown User', profilePic: null };
          if (otherUserSnap.exists()) {
            const userData = otherUserSnap.data();
            // Check if blocked by other user - add null check
            const otherUserBlockedUsers = userData.blockedUsers || [];
            if (otherUserBlockedUsers.includes(currentUser.uid)) {
              continue; // Skip this chat if blocked by other user
            }
            otherUserData = userData;
          }
          
          chatList.push({
            id: docSnap.id,
            ...chatData,
            otherUser: otherUserData,
            otherUserId
          });
        } catch (error) {
          console.error('Error fetching other user data:', error);
        }
      }
      
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, blockedUsers, isGuest]);

  // Show empty state for guests
  if (isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={50} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Guest Mode</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Create an account to access messages
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={50} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No conversations yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your messages with other users will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.primary2 }]}>
        <CustomNavBar />
      </SafeAreaView>
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
    borderBottomColor: '#E8E8E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0C2340',
    textAlign: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0C2340',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarFallbackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C2340',
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    backgroundColor: '#0C2340',
  },
  unreadCard: {
    backgroundColor: '#F8F9FA',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unreadText: {
    fontWeight: '600',
    color: '#0C2340',
  },
  badge: {
    backgroundColor: '#0C2340',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InboxScreen;