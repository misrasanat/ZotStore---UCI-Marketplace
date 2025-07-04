import React, { useState } from 'react';
import MessageBubble from './MessageBubble';
import {View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, navigation} from 'react-native';

const mockMessages = [
  { id: '1', text: 'Hey! Is the fridge still available?', fromSelf: false },
  { id: '2', text: 'Yep! Still available :)', fromSelf: true },
  { id: '3', text: 'Awesome, I’m interested.', fromSelf: false },
];

const ChatScreen = ({route, navigation}) => {
  const [messages, setMessages] = useState(mockMessages);
  const [newMsg, setNewMsg] = useState('');

  const handleSend = () => {
    if (!newMsg.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: newMsg.trim(),
      fromSelf: true,
    };
    setMessages([...messages, newMessage]);
    setNewMsg('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={styles.header}>
        <View style={styles.headerSide}>
            <TouchableOpacity onPress={() => navigation.navigate('Inbox Screen')}>
                <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Peter Anteater</Text>
        </View>

        <View style={styles.headerSide} />
    </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble text={item.text} fromSelf={item.fromSelf} />
        )}
        contentContainerStyle={styles.messagesContainer}
      />

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
    paddingBottom: '15%',
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
    paddingVertical: 16,
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
    backgroundColor: '#fdfff5',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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