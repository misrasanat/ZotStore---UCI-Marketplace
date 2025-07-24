import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

const CustomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;

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
            <Icon name="message-square" size={24} color={getIconColor('Inbox Screen')} />
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