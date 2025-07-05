import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth  } from './firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';

export default function Signup2({ navigation, route }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  const db = getFirestore();
  const user = auth.currentUser;
  const uid = user.uid;
  const userRef = doc(db, 'users', uid);



  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const handleContinue = async() => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number (at least 10 digits).');
      return;
    }

    try {
      await setDoc(userRef, {
        name: name,
        phone: phone,
        bio: bio,
        email: user.email,
        uid: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        isVerified: false,
        isActive: true,
      });
      Alert.alert('Success', 'Profile created successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Force navigation to Home by resetting the navigation stack
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Error setting user data:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete Profile</Text>
      <Text style={styles.subtitle}>Tell us about yourself</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Full Name *"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Bio (Optional)"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c5aa0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 18,
    backgroundColor: '#ffffff',
    fontSize: 16,
    color: '#495057',
  },
  bioInput: {
    height: 80,
    paddingTop: 12,
    paddingBottom: 12,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#2c5aa0',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: 'bold',
    letterSpacing: 1.1,
  }
});