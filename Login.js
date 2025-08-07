import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { auth, signInWithEmailAndPassword, sendEmailVerification } from './firebase';
import { reload } from 'firebase/auth';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateUCIEmail = (email) => {
    const uciEmailRegex = /^[a-zA-Z0-9._%+-]+@uci\.edu$/;
    return uciEmailRegex.test(email);
  };

  const isTestAccount = (email) => {
    return email.toLowerCase() === 'testersm@uci.edu';
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (!validateUCIEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid UCI email address (@uci.edu).');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user.uid);
      
      // Reload user to get latest email verification status
      await reload(user);
      console.log('Email verification status:', user.emailVerified);
      
      // Skip verification check for test account
      if (!user.emailVerified && !isTestAccount(email)) {
        Alert.alert(
          'Email Not Verified', 
          'Please check your email and verify your account before logging in. If you have already verified your email, try logging in again.',
          [
            {
              text: 'Resend Verification',
              onPress: async () => {
                try {
                  await sendEmailVerification(user);
                  Alert.alert('Verification Email Sent', 'Please check your inbox.');
                } catch (error) {
                  console.error('Error sending verification email:', error);
                  Alert.alert('Error', 'Failed to send verification email. Please try again.');
                }
              }
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      // Email is verified or test account, let AuthContext handle the routing
      
    } catch (error) {
      console.error('Error logging in:', error);
      let errorMessage = 'Failed to log in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={styles.container2}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.subtitle}>Welcome back to ZotStore</Text>
      
      <TextInput
        style={styles.input}
        placeholder="UCI Email (e.g., netid@uci.edu)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={handleSignup} disabled={loading}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 24,
    paddingBottom: 0,
  },
  container2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 30,
    color: '#0064a4',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0064a4',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#0064a4',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    fontSize: 16,
    color: '#0064a4',
    fontWeight: 'bold',
  },
});