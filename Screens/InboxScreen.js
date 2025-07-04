import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

const mockConversations = [
  {
    id: '1',
    user: 'Peter Anteater',
    avatar: 'https://i.pravatar.cc/150?img=12',
    lastMessage: 'Hey! Is that fridge still available?',
    timestamp: '2h ago',
  },
  {
    id: '2',
    user: 'Amanda L.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    lastMessage: 'Thanks for the textbook bundle!',
    timestamp: '3d ago',
  },
  {
    id: '3',
    user: 'Ben O.',
    avatar: 'https://i.pravatar.cc/150?img=9',
    lastMessage: 'Can you meet near Aldrich Hall?',
    timestamp: 'Just now',
  },
];

const InboxScreen = ({ navigation }) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Chat Screen', { user: item.user })}
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>
      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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

export default InboxScreen;