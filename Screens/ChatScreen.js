import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import {View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, navigation, Image} from 'react-native';
import { db } from '../firebase';
import { collection, addDoc, doc, query, orderBy, onSnapshot, setDoc, getDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useHeaderHeight } from '@react-navigation/elements';
import { Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './CustomNavbar.js';
import { useUnread } from '../UnreadContext';
import { useTheme } from '../ThemeContext';



const ChatScreen = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const headerHeight = useHeaderHeight();
  const [bottomPadding, setBottomPadding] = useState(60);
  const { refreshUnreadStatus } = useUnread();
  const { colors } = useTheme();

  const handleSend = async () => {
    if (!newMsg.trim()) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;
    const receiverId = route.params.userId;
    const chatId = [currentUser.uid, receiverId].sort().join('_');
    
    try {
      // First, get or create chat document with initialized unread counts
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      // Initialize chat document if it doesn't exist
      if (!chatDoc.exists()) {
        await setDoc(chatRef, {
          participants: [currentUser.uid, receiverId],
          unreadCount: {
            [currentUser.uid]: 0,
            [receiverId]: 0
          },
          lastMessage: null
        });
      } else if (!chatDoc.data().participants) {
        // If chat exists but missing participants field, add it
        await updateDoc(chatRef, {
          participants: [currentUser.uid, receiverId]
        });
      }

      // Add the message
      const messageRef = collection(db, 'chats', chatId, 'messages');
      await addDoc(messageRef, {
        text: newMsg.trim(),
        senderUid: currentUser.uid,
        timestamp: new Date()
      });

    // await setDoc(doc(db, 'chats', chatId), {
    //   participants: [currentUser.uid, receiverId],
    //   lastMessage: {
    //     text: newMsg.trim(),
    //     timestamp: serverTimestamp()
    //   }
    // }, { merge: true });

    // Update chat document with new message and increment unread
    const updateData = {
      lastMessage: {
        text: newMsg.trim(),
        timestamp: serverTimestamp(),
        senderUid: currentUser.uid
      },
      [`unreadCount.${receiverId}`]: increment(1)
    };

    await updateDoc(chatRef, updateData);


      setNewMsg('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Clear unread messages when opening chat
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const receiverId = route.params.userId;
    const chatId = [currentUser.uid, receiverId].sort().join('_');
    
    const clearUnread = async () => {
      try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);
        
        if (chatDoc.exists()) {
          // Reset unread count for current user
          await updateDoc(chatRef, {
            [`unreadCount.${currentUser.uid}`]: 0
          });
          // Refresh the unread status immediately
          refreshUnreadStatus();
        } else {
          // Initialize chat document if it doesn't exist
          await setDoc(chatRef, {
            participants: [currentUser.uid, receiverId],
            unreadCount: {
              [currentUser.uid]: 0,
              [receiverId]: 0
            },
            lastMessage: null
          });
        }
      } catch (error) {
        console.error('Error clearing unread count:', error);
      }
    };

    clearUnread();
  }, [route.params.userId]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const receiverId = route.params.userId;
    const chatId = [currentUser.uid, receiverId].sort().join('_');
    // Mark as read when chat is opened
    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, {
      [`unreadCount.${currentUser.uid}`]: 0
    }).then(() => {
      // Refresh the unread status immediately
      refreshUnreadStatus();
    }).catch(error => {
      console.error('Error clearing unread count:', error);
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

  useEffect(() => {
    // Scroll to bottom when messages change or when first loading
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
      <SafeAreaView edges={['top']} style={[styles.safeContainer, { backgroundColor: colors.primary}]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerSide}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={[styles.backText, { color: colors.textLight }]}>←</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.headerCenter}>
            {/* {receiverInfo?.profilePic && (
                <Image
                  source={{ uri: receiverInfo.profilePic }}
                  style={{ width: 68, height: 58, borderRadius: 30, marginRight: 0 }}
                />
              )} */}
              <TouchableOpacity onPress={() => navigation.navigate('Other User', { userId: route.params.userId })}>
                <Text style={[styles.headerTitle, { color: colors.textLight }]}>{receiverInfo?.name || 'Loading...'}</Text>
              </TouchableOpacity>
          </View>

          <View style={styles.headerSide} />
      </View>
      </SafeAreaView>


        {loading ? (
          <Text style={[{ padding: 16, fontStyle: 'italic' }, { color: colors.text }]}>Loading chat...</Text>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble text={item.text} fromSelf={item.fromSelf} />
            )}
            contentContainerStyle={[styles.messagesContainer, { backgroundColor: colors.background }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        

        <View style={[styles.inputRow, { backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeholder}
            value={newMsg}
            onChangeText={setNewMsg}
          />
          <TouchableOpacity onPress={handleSend} style={[styles.sendButton, { backgroundColor: colors.primary }]}>
            <Text style={[styles.sendText, { color: colors.textLight }]}>➤</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
        <SafeAreaView  edges={['bottom']} style={[styles.safeContainer2, { backgroundColor: colors.primary2 }]}>
          <CustomNavBar />
        </SafeAreaView>
      
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
  },
  safeContainer: {
  },
  safeContainer2: {
    },
  backButton: {
    padding: 12,
    marginRight: 8,
  },
  
  backText: {
      fontSize: 38,
      fontWeight: '600',
  },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
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
      alignSelf: 'flex-end',
      borderBottomRightRadius: 0,
    },
    other: {
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 0,
    },
    bubbleText: { },
    inputRow: {
      flexDirection: 'row',
      padding: 12,
      borderTopWidth: 1,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginRight: 8,
    },
    sendButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
    },
    sendText: {
      fontSize: 16,
    },
    navBar: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 50,
          borderTopWidth: 1,
          
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