import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useUnread } from '../UnreadContext';

const CustomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;
  const { hasUnread } = useUnread();

  const getIconColor = (screenName) => {
    const matchScreen = {
      'Home': 'Home',
      'Inbox Screen': 'Inbox Screen',
      'My Listings': 'My Listings'
    };
    return currentScreen === matchScreen[screenName] ? '#fff' : 'rgba(255, 255, 255, 0.6)';
  };

  return (
    <View style={styles.navBar}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
        >
            <Icon name="home" size={24} color={getIconColor('Home')} />
            {currentScreen === 'Home' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Inbox Screen')}
        >
            <View style={styles.iconContainer}>
                <Icon name="message-square" size={24} color={getIconColor('Inbox Screen')} />
                {hasUnread && <View style={styles.unreadDot} />}
            </View>
            {currentScreen === 'Inbox Screen' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('My Listings')}
        >
            <Icon name="list" size={24} color={getIconColor('My Listings')} />
            {currentScreen === 'My Listings' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#0C2340',
        borderTopWidth: 1,
        borderTopColor: '#10253dff',
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        paddingHorizontal: 16,
        position: 'relative',
    },
    iconContainer: {
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#ff0000',
        borderWidth: 2,
        borderColor: '#fff',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 24,
        height: 3,
        backgroundColor: '#fff',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
    navText: {
        fontSize: 26,
        color: '#444',
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default CustomNavBar;