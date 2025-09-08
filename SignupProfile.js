import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { auth  } from './firebase';
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { useAuth } from './AuthContext';
import DropDownPicker from 'react-native-dropdown-picker';

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

  // Add these state variables for picker open states
  const [studentTypeOpen, setStudentTypeOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [locationTypeOpen, setLocationTypeOpen] = useState(false);
  const [campusAreaOpen, setCampusAreaOpen] = useState(false);

  // Add picker items state
  const [studentTypeItems] = useState([
    { label: 'Undergraduate', value: 'Undergraduate' },
    { label: 'Graduate', value: 'Graduate' },
  ]);
  const [yearItems] = useState([
    { label: '1st Year', value: '1st Year' },
    { label: '2nd Year', value: '2nd Year' },
    { label: '3rd Year', value: '3rd Year' },
    { label: '4th Year', value: '4th Year' },
  ]);
  const [locationTypeItems] = useState([
    { label: 'On Campus', value: 'on-campus' },
    { label: 'Off Campus', value: 'off-campus' },
  ]);
  const [campusAreaItems] = useState([
    { label: 'Middle Earth', value: 'middle-earth' },
    { label: 'Mesa Court', value: 'mesa-court' },
  ]);

  // Add closeAllDropdowns function
  const closeAllDropdowns = (except) => {
    if (except !== 'studentType') setStudentTypeOpen(false);
    if (except !== 'year') setYearOpen(false);
    if (except !== 'locationType') setLocationTypeOpen(false);
    if (except !== 'campusArea') setCampusAreaOpen(false);
  };

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
      <View style={[styles.pickerContainer, { zIndex: 4000 }]}>
        <Text style={styles.pickerLabel}>Student Type *</Text>
        <DropDownPicker
          open={studentTypeOpen}
          value={studentType}
          items={studentTypeItems}
          setOpen={(open) => {
            if (open) closeAllDropdowns('studentType');
            setStudentTypeOpen(open);
          }}
          setValue={setStudentType}
          placeholder="Select Student Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          zIndex={4000}
          zIndexInverse={1000}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
      </View>

      {/* Year Selection */}
      <View style={[styles.pickerContainer, { zIndex: 3000 }]}>
        <Text style={styles.pickerLabel}>Year</Text>
        <DropDownPicker
          open={yearOpen}
          value={year}
          items={yearItems}
          setOpen={(open) => {
            if (open) closeAllDropdowns('year');
            setYearOpen(open);
          }}
          setValue={setYear}
          placeholder="Select Year"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          zIndex={3000}
          zIndexInverse={2000}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
      </View>

      {/* Location Type Selection */}
      <View style={[styles.pickerContainer, { zIndex: 2000 }]}>
        <Text style={styles.pickerLabel}>Location Type</Text>
        <DropDownPicker
          open={locationTypeOpen}
          value={locationType}
          items={locationTypeItems}
          setOpen={(open) => {
            if (open) closeAllDropdowns('locationType');
            setLocationTypeOpen(open);
          }}
          setValue={setLocationType}
          placeholder="Select Location Type"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
      </View>

      {/* On Campus Options */}
      {locationType === 'on-campus' && (
        <>
          <View style={[styles.pickerContainer, { zIndex: 1000 }]}>
            <Text style={styles.pickerLabel}>Campus Area</Text>
            <DropDownPicker
              open={campusAreaOpen}
              value={campusArea}
              items={campusAreaItems}
              setOpen={(open) => {
                if (open) closeAllDropdowns('campusArea');
                setCampusAreaOpen(open);
              }}
              setValue={setCampusArea}
              placeholder="Select Campus Area"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
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
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  dropdown: {
    borderColor: '#dee2e6',
    borderRadius: 8,
    minHeight: 40,
  },
  dropdownContainer: {
    borderColor: '#dee2e6',
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#495057',
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