import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Auth({ navigation }) {
  const { setGuestMode } = useAuth();
  const { colors, loading, isDarkMode } = useTheme();

  // Provide fallback colors if theme is not ready
  const safeColors = colors || {
    background: '#ffffff',
    primary: '#0C2340',
    border: '#dee2e6',
    textLight: '#ffffff',
    text: '#495057'
  };

  // Show loading state while theme is being initialized
  if (loading) {
    return null; // or return a simple loading spinner
  }

  const handleUCISSOLogin = async () => {
    WebBrowser.openBrowserAsync('https://login.uci.edu/ucinetid/webauth');
  };

  const handleEmailLogin = () => {
    navigation.navigate('Login');
  };

  const handleEmailSignup = () => {
    navigation.navigate('Signup');
  };

  const handleGuestMode = () => {
    setGuestMode();
    // Navigation will happen automatically due to AuthContext state change
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={isDarkMode 
          ? ['#002244', '#0064A4', '#001a2e'] 
          : ['#0064A4', '#0078c7', '#FFD700']
        }
        locations={[0, 0.6, 1]}
        style={styles.gradientBackground}
      />
      
      {/* UCI Themed Decorative Elements */}
      <View style={[styles.decorativeCircle1, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]} />
      <View style={[styles.decorativeCircle2, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]} />
      <View style={[styles.decorativeCircle3, { backgroundColor: 'rgba(255, 215, 0, 0.2)' }]} />
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('./assets/ZotStore_Logo-removebg-preview.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          
          <Text style={[styles.welcomeText, { color: '#FFFFFF' }]}>
            Welcome to ZotStore
          </Text>
          <Text style={[styles.tagline, { color: '#FFD700' }]}>
            Official UCI Marketplace
          </Text>
          <Text style={[styles.description, { color: '#FFFFFF' }]}>
            Buy, sell, and connect with fellow Anteaters!
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Buttons Section */}
        <View style={styles.buttonsContainer}>
          {/* Login Button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleEmailLogin}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#002244', '#0064A4', '#0078c7']}
              style={styles.buttonGradient}
            >
              <Ionicons name="mail" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Login with Email</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* UCI Signup Button */}
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleEmailSignup}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(255, 215, 0, 0.9)', 'rgba(255, 204, 0, 0.9)']}
              style={styles.buttonGradient}
            >
              <Ionicons name="school" size={20} color="#002244" style={styles.buttonIcon} />
              <Text style={[styles.primaryButtonText, { color: '#002244' }]}>
                Create UCI Account 🎓
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Non-UCI Signup Button */}
          <TouchableOpacity 
            style={styles.tertiaryButton}
            onPress={() => navigation.navigate('SignupNonUCI')}
            activeOpacity={0.8}
          >
            <View style={[styles.secondaryButtonContent, { borderColor: '#FFFFFF', backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
              <Ionicons name="person-add" size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={[styles.secondaryButtonText, { color: '#FFFFFF' }]}>
                Create Visitor Account
              </Text>
            </View>
          </TouchableOpacity>

          {/* Guest Button */}
          <TouchableOpacity 
            style={styles.guestButton}
            onPress={handleGuestMode}
            activeOpacity={0.8}
          >
            <View style={[styles.guestButtonContent, { borderColor: '#FFD700' }]}>
              <Ionicons name="eye" size={20} color="#FFD700" style={styles.buttonIcon} />
              <Text style={[styles.guestButtonText, { color: '#FFD700' }]}>
                Browse as Guest
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={[styles.footerText, { color: '#FFFFFF' }]}>
            Join thousands of UCI Anteaters already using ZotStore
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0064A4', // UCI Blue fallback
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    right: -50,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    bottom: 100,
    left: -30,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: height * 0.3,
    right: 30,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 10,
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 17,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: 26,
    paddingHorizontal: 15,
    marginBottom: 0,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  spacer: {
    height: 20,
  },
  buttonsContainer: {
    paddingHorizontal: 0,
    paddingVertical: 20,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: '100%',
    marginBottom: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryButtonContent: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tertiaryButton: {
    width: '100%',
    marginBottom: 15,
  },
  guestButton: {
    width: '100%',
    marginBottom: 20,
  },
  guestButtonContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 34, 68, 0.2)',
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  footerSection: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 8,
  },
});
