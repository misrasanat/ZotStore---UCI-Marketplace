import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

export default function Auth({ navigation }) {
  const handleUCISSOLogin = async () => {
    WebBrowser.openBrowserAsync('https://login.uci.edu/ucinetid/webauth');
    // const redirectUri = AuthSession.makeRedirectUri();
    // const authUrl = `https://login.uci.edu/ucinetid/webauth?redirect_uri=${encodeURIComponent(redirectUri)}`;
    // const result = await AuthSession.startAsync({ authUrl });
    // if (result.type === 'success') {
    //   navigation.navigate('Home');
    // }
  };

  const handleEmailLogin = () => {
    navigation.navigate('Login');
  };

  const handleEmailSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.outerContainer}>
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
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailLogin}>
          <Text style={styles.emailButtonText}>Login with Email</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signupButton} onPress={handleEmailSignup}>
          <Text style={styles.signupButtonText}>Create New Account</Text>
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
  signupButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
});
