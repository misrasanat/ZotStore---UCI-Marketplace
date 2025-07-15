import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { formatRelative } from 'date-fns'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';





const InboxScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Chat Screen', { userId: item.userId })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.username}>{item.user}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.time}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const fetchChats = async () => {
      
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));
      const chatDocs = await getDocs(q);

      const convoList = [];

      setLoading(true);
      try{
        for (const docSnap of chatDocs.docs) {
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
            convoList.push({
              id: docSnap.id,
              user: userData.name || 'Unknown',
              userId: otherUserId,
              avatar: userData.profilePic || 'https://i.pravatar.cc/150?img=1',
              lastMessage: data.lastMessage?.text || '',
              timestamp: formatRelative(data.lastMessage?.timestamp?.toDate(), new Date()) || 'now'
            });
          }
        }

        setConversations(convoList);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>
      {loading ? (
        <Text style={{ padding: 16 }}>Loading conversations...</Text>
      ) : conversations.length === 0 ? (
        <Text style={{ padding: 16, fontStyle: 'italic' }}>No conversations yet.</Text>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
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
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: {
    fontSize: 24,
    fontWeight: '700',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 15,
    color: '#555',
  },
  time: {
    fontSize: 12,
    color: '#999',
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

export default InboxScreen;