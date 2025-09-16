import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useUnread } from '../UnreadContext';
import { db } from '../firebase';
import { doc, setDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useTheme } from '../ThemeContext';

const CustomNavBar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const currentScreen = route.name;
  const { hasUnread } = useUnread();
  const { colors } = useTheme();

  const getIconColor = (screenName) => {
    const matchScreen = {
      'Home': 'Home',
      'Inbox Screen': 'Inbox Screen',
      'My Listings': 'My Listings'
    };
    return currentScreen === matchScreen[screenName] ? colors.textLight : 'rgba(255, 255, 255, 0.6)';
  };

  return (
    <View style={[styles.navBar, { backgroundColor: colors.primary2 }]}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Home')}
        >
            <Icon name="home" size={24} color={getIconColor('Home')} />
            {currentScreen === 'Home' && <View style={[styles.activeIndicator, { backgroundColor: colors.textLight }]} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('Inbox Screen')}
        >
            <View style={styles.iconContainer}>
                <Icon name="message-square" size={24} color={getIconColor('Inbox Screen')} />
                {hasUnread && <View style={[styles.unreadDot, { backgroundColor: colors.error, borderColor: colors.textLight }]} />}
            </View>
            {currentScreen === 'Inbox Screen' && <View style={[styles.activeIndicator, { backgroundColor: colors.textLight }]} />}
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => navigation.navigate('My Listings')}
        >
            <Icon name="list" size={24} color={getIconColor('My Listings')} />
            {currentScreen === 'My Listings' && <View style={[styles.activeIndicator, { backgroundColor: colors.textLight }]} />}
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
        borderTopWidth: 1,
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
        top: -6,
        right: -6,
        width: 12,
        height: 12,
        borderRadius: 8,
        borderWidth: 2,
        zIndex: 1000,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 24,
        height: 3,
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