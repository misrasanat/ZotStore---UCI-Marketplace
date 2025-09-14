import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatRelative } from 'date-fns';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useUnread } from '../UnreadContext'; // adjust path as needed
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
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { refreshUnreadStatus } = useUnread();
  const { colors } = useTheme();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={async () => {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        const chatRef = doc(db, 'chats', item.id);
        await updateDoc(chatRef, {
          [`unreadCount.${currentUser.uid}`]: 0
        });
        // Refresh the unread status immediately
        refreshUnreadStatus();
        navigation.navigate('Chat Screen', { userId: item.userId });
      }}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarFallbackText, { color: colors.textLight }]}>
              {item.user.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[
            styles.username,
            { color: colors.text },
            item.unreadCount > 0 && styles.unreadText
          ]} numberOfLines={1}>{item.user}</Text>
          <Text style={[styles.time, { color: colors.textSecondary }]}>{item.timestamp}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text 
            style={[
              styles.message,
              { color: colors.textSecondary },
              item.unreadCount > 0 && styles.unreadText
            ]} 
            numberOfLines={1}
          >
            {item.lastMessage || 'No messages yet'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.error }]}>
              <Text style={[styles.badgeText, { color: colors.textLight }]}>
                {item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const convoList = [];
        
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() || {};
          const participants = Array.isArray(data.participants) ? data.participants : [];
          let otherUserId = participants.find(uid => uid !== currentUser.uid);
          if (!otherUserId && participants.length === 1 && participants[0] === currentUser.uid) {
            otherUserId = currentUser.uid;
          }
          if (!otherUserId) continue; 
          const userRef = doc(db, 'users', otherUserId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const unreadCount = data.unreadCount?.[currentUser.uid] || 0;
            
            convoList.push({
              id: docSnap.id,
              user: userData.name || 'Unknown',
              userId: otherUserId,
              avatar: userData.profilePic || 'https://i.pravatar.cc/150?img=1',
              lastMessage: data.lastMessage?.text || '',
              timestamp: formatMessageTimestamp(data.lastMessage?.timestamp),
              unreadCount: unreadCount,
              isNew: isNewMessage(data.lastMessage?.timestamp),
              rawTimestamp: data.lastMessage?.timestamp
            });
          }
        }

        convoList.sort((a, b) => {
          if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
          if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
          
          const aTime = a.rawTimestamp?.toDate?.() || new Date(0);
          const bTime = b.rawTimestamp?.toDate?.() || new Date(0);
          return bTime - aTime;
        });

        setConversations(convoList);
      } catch (error) {
        console.error('Error in real-time update:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Real-time listener error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const { hasUnread } = useUnread();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Messages</Text>
      </SafeAreaView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="message-circle" size={50} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.text }]}>No conversations yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your messages with other users will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}

        />
      )}

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: colors.primary }]}>
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