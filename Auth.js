import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';

export default function Auth({ navigation }) {
  const { setGuestMode } = useAuth();
  const { colors, loading } = useTheme();

  // Debug logging
  // Debug logging
  console.log('Auth component - colors:', colors);
  console.log('Auth component - loading:', loading);

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
    <View style={[styles.outerContainer, { backgroundColor: safeColors.background }]}>
      <View style={styles.headerAccent} />
      <View style={styles.topSection}>
        <Text style={styles.welcome}>Welcome to</Text>
        <Text style={styles.title}>ZotStore</Text>
        <Text style={styles.subtitle}>UCI Marketplace</Text>
        <Text style={styles.description}>
          Buy, sell, and connect with fellow Anteaters!
        </Text>
      </View>
      <View style={styles.centerSection}>
        {/* <TouchableOpacity style={styles.ssoButton} onPress={handleUCISSOLogin}>
          <Text style={styles.ssoButtonText}>Login with UCI SSO</Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
          style={[
            styles.emailButton,
            { backgroundColor: safeColors.primary }
          ]}
          onPress={handleEmailLogin}
        >
          <Text style={[styles.emailButtonText, { color: safeColors.textLight }]}>
            Login with Email
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.signupButton,
            { borderColor: safeColors.primary }
          ]}
          onPress={handleEmailSignup}
        >
          <Text style={[
            styles.signupButtonText
          ]}>
            Create Account (UCI)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.signupButton, 
            styles.nonUCIButton,
          ]} 
          onPress={() => navigation.navigate('SignupNonUCI')}
        >
          <Text style={[
            styles.signupButtonText
          ]}>
            Create Account (Non-UCI)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.guestButton]} 
          onPress={handleGuestMode}
        >
          <Text style={styles.guestButtonText}>Enter as Guest</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footerAccent} />

    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    justifyContent: 'space-between',
  },
  footerAccent: {
    height: 80,
    backgroundColor: '#ffb400',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  topSection: {
    marginTop: 70,
    alignItems: 'center',
    marginBottom: 24,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  welcome: {
    fontSize: 22,
    color: '#0064a4',
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#0064a4',
    marginBottom: 2,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 20,
    color: '#ffb400',
    fontWeight: '700',
    marginBottom: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 0,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ssoButton: {
    width: '80%',
    backgroundColor: '#0064a4',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  ssoButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  emailButton: {
    width: '80%',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0064a4',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },
  emailButtonText: {
    color: '#0064a4',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  signupButton: {
    width: '80%',
    backgroundColor: '#ffb400',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  nonUCIButton: {
    backgroundColor: '#666',
    marginTop: 10,
  },
  guestButton: {
    width: '80%',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6c757d',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  guestButtonText: {
    color: '#6c757d',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
});
