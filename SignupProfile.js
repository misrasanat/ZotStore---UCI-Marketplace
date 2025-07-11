import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth  } from './firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';
import { Picker } from '@react-native-picker/picker';

export default function Signup2({ navigation, route }) {
  const { refreshAuthState } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [major, setMajor] = useState('');
  const [studentType, setStudentType] = useState('Undergraduate'); // 'Undergraduate' or 'Graduate'
  const [year, setYear] = useState('');
  const [bio, setBio] = useState('');
  const [locationType, setLocationType] = useState('on-campus'); // 'on-campus' or 'off-campus'
  const [campusArea, setCampusArea] = useState(''); // 'middle-earth' or 'mesa-court'
  const [buildingName, setBuildingName] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  
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
    if (!major.trim()) {
      Alert.alert('Error', 'Please enter your major.');
      return;
    }

    try {
      await setDoc(userRef, {
        name: name,
        phone: phone,
        major: major,
        studentType: studentType,
        year: year,
        bio: bio,
        locationType: locationType,
        campusArea: campusArea,
        buildingName: buildingName,
        apartmentName: apartmentName,
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
          onPress: async () => {
            // Refresh auth state to detect the new profile
            await refreshAuthState();
            // Navigate back to Auth screen, which will then redirect to Home
            // once AuthContext detects the complete profile
            navigation.navigate('Auth');
          }
        }
      ]);
    } catch (error) {
      console.error('Error setting user data:', error);
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    }
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
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
        style={styles.input}
        placeholder="Major *"
        value={major}
        onChangeText={setMajor}
        autoCapitalize="words"
      />

            {/* Student Type Selection */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Student Type *</Text>
        <Picker
          selectedValue={studentType}
          onValueChange={(itemValue) => {
            setStudentType(itemValue);
            setYear(''); // Reset year when student type changes
          }}
          style={styles.picker}
        >
          <Picker.Item label="Undergraduate" value="Undergraduate" />
          <Picker.Item label="Graduate" value="Graduate" />
        </Picker>
      </View>

      {/* Year Selection */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Year</Text>
        <Picker
          selectedValue={year}
          onValueChange={setYear}
          style={styles.picker}
        >
              <Picker.Item label="1st Year" value="1st Year" />
              <Picker.Item label="2nd Year" value="2nd Year" />
              <Picker.Item label="3rd Year" value="3rd Year" />
              <Picker.Item label="4th Year" value="4th Year" />
        </Picker>
      </View>

      {/* Location Type Selection */}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Location Type</Text>
        <Picker
          selectedValue={locationType}
          onValueChange={(itemValue) => {
            setLocationType(itemValue);
            setCampusArea('');
            setBuildingName('');
            setApartmentName('');
          }}
          style={styles.picker}
        >
          <Picker.Item label="On Campus" value="on-campus" />
          <Picker.Item label="Off Campus" value="off-campus" />
        </Picker>
      </View>

      {/* On Campus Options */}
      {locationType === 'on-campus' && (
        <>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Campus Area</Text>
            <Picker
              selectedValue={campusArea}
              onValueChange={setCampusArea}
              style={styles.picker}
            >
              <Picker.Item label="Select Area" value="" />
              <Picker.Item label="Middle Earth" value="middle-earth" />
              <Picker.Item label="Mesa Court" value="mesa-court" />
            </Picker>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Building Name"
            value={buildingName}
            onChangeText={setBuildingName}
            autoCapitalize="words"
          />
        </>
      )}

      {/* Off Campus Options */}
      {locationType === 'off-campus' && (
        <TextInput
          style={styles.input}
          placeholder="Apartment Name"
          value={apartmentName}
          onChangeText={setApartmentName}
          autoCapitalize="words"
        />
      )}
      
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  pickerContainer: {
    width: '100%',
    marginBottom: 18,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  picker: {
    width: '100%',
    height: 50,
    borderColor: '#dee2e6',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ffffff',
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