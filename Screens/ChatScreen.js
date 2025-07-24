import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import {View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, navigation, Image} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../firebase';
import { collection, addDoc, doc, query, orderBy, onSnapshot, setDoc, getDoc, serverTimestamp, increment, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useHeaderHeight } from '@react-navigation/elements';
import { Keyboard } from 'react-native';




const ChatScreen = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const headerHeight = useHeaderHeight();
  const [bottomPadding, setBottomPadding] = useState(60);

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;
    const receiverId = route.params.userId;
    const chatId = [currentUser.uid, receiverId].sort().join('_');
    
    const messageRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messageRef, {
      text: newMsg.trim(),
      senderUid: currentUser.uid,
      timestamp: new Date()
    });

    await setDoc(doc(db, 'chats', chatId), {
      participants: [currentUser.uid, receiverId],
      lastMessage: {
        text: newMsg.trim(),
        timestamp: serverTimestamp()
      }
    }, { merge: true });

    await updateDoc(doc(db, 'chats', chatId), {
      [`unreadCount.${receiverId}`]: increment(1)
    }, { merge: true });

    setNewMsg('');
  };

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const receiverId = route.params.userId;
    const chatId = [currentUser.uid, receiverId].sort().join('_');
    // Mark as read when chat is opened
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, {
      [`unreadCount.${currentUser.uid}`]: 0
    });
    const showSub = Keyboard.addListener('keyboardDidShow', () => setBottomPadding(0));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setBottomPadding(30));

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    const fetchReceiver = async () => {
      try {
        const receiverRef = doc(db, 'users', receiverId);
        const receiverSnap = await getDoc(receiverRef);
        if (receiverSnap.exists()) {
          setReceiverInfo(receiverSnap.data());
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching receiver info:', error);
      }
    };
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), fromSelf: doc.data().senderUid === currentUser.uid }));
      setMessages(msgs);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100); // gives React time to render
    });

    fetchReceiver();
    return () => {
      showSub.remove();
      hideSub.remove();
      unsubscribe();
    };
  }, []);

  return (
    <View style={[styles.container]}>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={headerHeight}
    >
    <SafeAreaView edges={['top']} style={styles.safeContainer}>
    <View style={styles.header}>
        <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          {receiverInfo?.profilePic && (
              <Image
                source={{ uri: receiverInfo.profilePic }}
                style={{ width: 68, height: 58, borderRadius: 30, marginRight: 0 }}
              />
            )}
            <Text style={styles.headerTitle}>{receiverInfo?.name || 'Loading...'}</Text>
        </View>

        <View style={styles.headerSide} />
    </View>
    </SafeAreaView>


      {loading ? (
        <Text style={{ padding: 16, fontStyle: 'italic' }}>Loading chat...</Text>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble text={item.text} fromSelf={item.fromSelf} />
          )}
          contentContainerStyle={styles.messagesContainer}
        />
      )}
      

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMsg}
          onChangeText={setNewMsg}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
safeContainer: {
  backgroundColor: '#194a7a',
},
backButton: {
  padding: 12,
  marginRight: 8,
},

backText: {
    fontSize: 38,
    color: '#fff',
    fontWeight: '600',
},
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#194a7a',
    paddingBottom: 10,
    paddingHorizontal: 16
  },
headerSide: {
  width: 50,
  alignItems: 'flex-start',
},

headerCenter: {
  flex: 1,
  alignItems: 'center',
  
},

headerTitle: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  paddingBottom: 5,
  paddingTop: 9,
},
  messagesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 16,
    marginVertical: 6,
  },
  self: {
    backgroundColor: '#194a7a',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  other: {
    backgroundColor: '#e5e5e5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  bubbleText: { color: '#000' },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#194a7a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
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

export default ChatScreen;