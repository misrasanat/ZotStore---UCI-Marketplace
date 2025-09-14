import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, signOut } from './firebase';
import { useAuth } from './AuthContext';
import { getFirestore, doc, setDoc, getDoc, getDocs, query, collection, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import DropDownPicker from 'react-native-dropdown-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomNavBar from './Screens/CustomNavbar.js';
import { uploadToCloudinary } from './utils/cloudinary';
import { useTheme } from './ThemeContext';

export default function Profile({ navigation }) {
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [studentType, setStudentType] = useState('');
  const [year, setYear] = useState('');
  const [locationType, setLocationType] = useState('');
  const [campusArea, setCampusArea] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [listingsCount, setListingsCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [boughtCount, setBoughtCount] = useState(0);

  // Dropdown open states
  const [studentTypeOpen, setStudentTypeOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [locationTypeOpen, setLocationTypeOpen] = useState(false);
  const [campusAreaOpen, setCampusAreaOpen] = useState(false);

  // Dropdown items
  const [studentTypeItems] = useState([
    { label: 'Undergraduate', value: 'undergrad' },
    { label: 'Graduate', value: 'grad' },
  ]);
  const [yearItems] = useState([
    { label: '1st Year', value: '1' },
    { label: '2nd Year', value: '2' },
    { label: '3rd Year', value: '3' },
    { label: '4th Year', value: '4' },
  ]);
  const [locationTypeItems] = useState([
    { label: 'On Campus', value: 'on-campus' },
    { label: 'Off Campus', value: 'off-campus' },
  ]);
  const [campusAreaItems] = useState([
    { label: 'Middle Earth', value: 'middle-earth' },
    { label: 'Mesa Court', value: 'mesa-court' },
  ]);

  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;
  const uid = user?.uid;
  const userRef = doc(db, 'users', uid);
  const { colors } = useTheme();

  // Close all dropdowns when one opens
  const closeAllDropdowns = (except) => {
    if (except !== 'studentType') setStudentTypeOpen(false);
    if (except !== 'year') setYearOpen(false);
    if (except !== 'locationType') setLocationTypeOpen(false);
    if (except !== 'campusArea') setCampusAreaOpen(false);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!uid) return;
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserData(userData);
          setName(userData.name || '');
          setPhone(userData.phone || '');
          setBio(userData.bio || '');
          setMajor(userData.major || '');
          setStudentType(userData.studentType || '');
          setYear(userData.year || '');
          setLocationType(userData.locationType || '');
          setCampusArea(userData.campusArea || '');
          setBuildingName(userData.buildingName || '');
          setApartmentName(userData.apartmentName || '');
          if (userData.profilePic) {
            setProfilePic(userData.profilePic);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchMarketplaceStats = async () => {
      if (!uid) return;
      try {
        // Total Listings
        const listingsSnap = await getDocs(query(
          collection(db, 'listings'),
          where('userId', '==', uid)
        ));
        setListingsCount(listingsSnap.size);

        // Sold Listings
        const soldSnap = await getDocs(query(
          collection(db, 'listings'),
          where('userId', '==', uid),
          where('status', '==', 'sold')
        ));
        setSoldCount(soldSnap.size);

        // Bought Listings
        const boughtSnap = await getDocs(query(
          collection(db, 'listings'),
          where('buyerId', '==', uid),
          where('status', '==', 'sold')
        ));
        setBoughtCount(boughtSnap.size);
      } catch (error) {
        console.error('Error fetching marketplace stats:', error);
      }
    };

    loadUserData();
    fetchMarketplaceStats();
  }, [uid]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled) {
        setProfilePic(result.assets[0].uri);
      }
    } 
    catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    try {
      let profilePicUrl = null;
      if (profilePic && !profilePic.startsWith('http')) {
        // Add Delete logic for previous profile picture from cloudinary if it exists
        profilePicUrl = await uploadToCloudinary(profilePic);
      } else if (profilePic && profilePic.startsWith('http')) {
        profilePicUrl = profilePic;
      }

      // Update Firestore with user data and profile picture URL
      await setDoc(userRef, {
        name: name,
        phone: phone,
        bio: bio,
        major: major,
        studentType: studentType,
        year: year,
        locationType: locationType,
        campusArea: campusArea,
        buildingName: buildingName,
        apartmentName: apartmentName,
        email: user.email,
        uid: uid,
        profilePic: profilePicUrl,
        updatedAt: new Date(),
      }, { merge: true });

      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    // TODO: Add real password change logic
    setShowPasswordForm(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert('Password changed!');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleAdditionalSettings = () => {
    // TODO: Add real additional settings logic
    navigation.navigate('Settings');
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <TouchableWithoutFeedback onPress={() => {
        Keyboard.dismiss();
        closeAllDropdowns();
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={[styles.keyboardContainer, { backgroundColor: colors.background }]}
          // keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
        >
          <ScrollView
            // style={styles.scrollView}
            // contentContainerStyle={styles.scrollContainer}
            // keyboardShouldPersistTaps="handled"
            // showsVerticalScrollIndicator={false}
            // bounces={true}
            // scrollEventThrottle={16}

              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled" 
              keyboardDismissMode="interactive"
              contentContainerStyle={{ paddingBottom: 100 }}
              nestedScrollEnabled={true}  // ✅ Add this
          >
            <View style={[styles.container, { backgroundColor: colors.background }]}>
              {/* Profile Picture & Name */}
              <View style={styles.headerSection}>
                <TouchableOpacity onPress={pickImage}>
                  <Image
                    source={profilePic ? { uri: profilePic } : require('./assets/icon.png')}
                    style={styles.avatar}
                    defaultSource={require('./assets/icon.png')}
                  />
                  {isEditing && <Text style={[styles.editPhotoText, { color: colors.text }]}>Edit Photo</Text>}
                </TouchableOpacity>
                {isEditing ? (
                  <TextInput
                    style={[styles.nameInput, { color: colors.text, backgroundColor: colors.input, borderColor: colors.inputBorder }]}
                    value={name}
                    onChangeText={setName}
                    placeholder="Full Name"
                    placeholderTextColor={colors.placeholder}
                  />
                ) : (
                  <Text style={[styles.name, { color: colors.text }]}>{loading ? 'Loading...' : (name || 'No name set')}</Text>
                )}
                <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email || 'Loading...'}</Text>
              </View>

              {/* Account Info */}
              <TouchableOpacity activeOpacity={1} style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Account Info</Text>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Phone:</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Phone Number"
                      placeholderTextColor={colors.placeholder}
                      keyboardType="phone-pad"
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{loading ? 'Loading...' : (phone || 'Not set')}</Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Bio:</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoInput, { height: 60, backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                      value={bio}
                      onChangeText={setBio}
                      placeholder="Short bio"
                      placeholderTextColor={colors.placeholder}
                      multiline
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{loading ? 'Loading...' : (bio)}</Text>
                  )}
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Major:</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                      value={major}
                      onChangeText={setMajor}
                      placeholder="Major"
                      placeholderTextColor={colors.placeholder}
                      autoCapitalize="words"
                    />
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{loading ? 'Loading...' : (major || 'Not set')}</Text>
                  )}
                </View>

                <View style={[styles.infoRow, { zIndex: 4000 }]}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Year:</Text>
                  {isEditing ? (
                    <View style={styles.pickerContainer}>
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
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                      {loading ? 'Loading...' : (year ? `${year}${year === '1' ? 'st' : year === '2' ? 'nd' : year === '3' ? 'rd' : 'th'} Year` : 'Not set')}
                    </Text>
                  )}
                </View>

                <View style={[styles.infoRow, { zIndex: studentTypeOpen ? 3000 : 0 }]}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Student Type:</Text>
                  {isEditing ? (
                    <View style={styles.pickerContainer}>
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
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                      {loading ? 'Loading...' : (studentType === 'undergrad' ? 'Undergraduate' : studentType === 'grad' ? 'Graduate' : 'Not set')}
                    </Text>
                  )}
                </View>
                
                <View style={[styles.infoRow, { zIndex: 2000 }]}>
                  <Text style={[styles.infoLabel, { color: colors.text }]}>Location Type:</Text>
                  {isEditing ? (
                    <View style={styles.pickerContainer}>
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
                        zIndex={2000}
                        zIndexInverse={3000}
                        listMode="SCROLLVIEW"
                        scrollViewProps={{
                          nestedScrollEnabled: true,
                        }}
                      />
                    </View>
                  ) : (
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                      {loading ? 'Loading...' : (locationType === 'on-campus' ? 'On Campus' : locationType === 'off-campus' ? 'Off Campus' : 'Not set')}
                    </Text>
                  )}
                </View>

                {/* On Campus Options */}
                {isEditing && locationType === 'on-campus' && (
                  <>
                    <View style={[styles.infoRow, { zIndex: 1000 }]}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>Campus Area:</Text>
                      <View style={styles.pickerContainer}>
                        <DropDownPicker
                          open={campusAreaOpen}
                          value={campusArea}
                          items={campusAreaItems}
                          setOpen={(open) => {
                            if (open) closeAllDropdowns('campusArea');
                            setCampusAreaOpen(open);
                          }}
                          setValue={setCampusArea}
                          placeholder="Select Area"
                          style={styles.dropdown}
                          dropDownContainerStyle={styles.dropdownContainer}
                          textStyle={styles.dropdownText}
                          zIndex={1000}
                          zIndexInverse={4000}
                          listMode="SCROLLVIEW"
                          scrollViewProps={{
                            nestedScrollEnabled: true,
                          }}
                        />
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: colors.text }]}>Building:</Text>
                      <TextInput
                        style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                        value={buildingName}
                        onChangeText={setBuildingName}
                        placeholder="Building Name"
                        placeholderTextColor={colors.placeholder}
                        autoCapitalize="words"
                      />
                    </View>
                  </>
                )}

                {/* Off Campus Options */}
                {isEditing && locationType === 'off-campus' && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Apartment:</Text>
                    <TextInput
                      style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                      value={apartmentName}
                      onChangeText={setApartmentName}
                      placeholder="Apartment Name"
                      placeholderTextColor={colors.placeholder}
                      autoCapitalize="words"
                    />
                  </View>
                )}

                {/* Display Location Info when not editing */}
                {!isEditing && (
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoLabel, { color: colors.text }]}>Location:</Text>
                    <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                      {loading ? 'Loading...' : (
                        locationType === 'on-campus' 
                          ? `On Campus - ${campusArea === 'middle-earth' ? 'Middle Earth' : campusArea === 'mesa-court' ? 'Mesa Court' : ''} - ${buildingName || ''}`
                          : locationType === 'off-campus'
                          ? `Off Campus - ${apartmentName || ''}`
                          : 'Not set'
                      )}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Marketplace Stats */}
              <TouchableOpacity activeOpacity={1} style={[styles.section, { backgroundColor: colors.card }]}>
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Marketplace Stats</Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{listingsCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Listings</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{soldCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sold</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={[styles.statNumber, { color: colors.text }]}>{boughtCount}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bought</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Edit Profile & Change Password */}
              <View style={[styles.section, { backgroundColor: colors.card }]}>
                {isEditing ? (
                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
                    <Text style={[styles.saveButtonText, { color: colors.textLight }]}>Save Changes</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.primary }]} onPress={() => setIsEditing(true)}>
                      <Text style={[styles.editButtonText, { color: colors.textLight }]}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.changePasswordButton, { backgroundColor: colors.primary }]} onPress={() => setShowPasswordForm(!showPasswordForm)}>
                      <Text style={[styles.changePasswordText, { color: colors.textLight }]}>Change Password</Text>
                    </TouchableOpacity>
                    {showPasswordForm && (
                      <View style={styles.passwordForm}>
                        <TextInput
                          style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="Current Password"
                          placeholderTextColor={colors.placeholder}
                          secureTextEntry
                        />
                        <TextInput
                          style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="New Password"
                          placeholderTextColor={colors.placeholder}
                          secureTextEntry
                        />
                        <TextInput
                          style={[styles.infoInput, { backgroundColor: colors.input, borderColor: colors.inputBorder, color: colors.text }]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Confirm New Password"
                          placeholderTextColor={colors.placeholder}
                          secureTextEntry
                        />
                        <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleChangePassword}>
                          <Text style={[styles.saveButtonText, { color: colors.textLight }]}>Save Password</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                    <TouchableOpacity style={[styles.settingsButton, { backgroundColor: colors.primary }]} onPress={handleAdditionalSettings}>
                      <Text style={[styles.settingsText, { color: colors.textLight }]}>Additional Settings</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Logout */}
              <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
                <Text style={[styles.logoutText, { color: colors.textLight }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
      
      {/* Navigation Bar - Outside ScrollView */}
      <SafeAreaView edges={['bottom']} style={styles.safeContainer2}>
        <CustomNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    paddingTop: 24,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  safeContainer2: {
    backgroundColor: '#0C2340',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },  
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    marginBottom: 8,
  },
  editPhotoText: {
    color: '#2c5aa0',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 2,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 2,
    borderBottomWidth: 1,
    borderColor: '#dee2e6',
    width: 200,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 8,
  },
  section: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c5aa0',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    width: 100,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  infoInput: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    borderBottomWidth: 1,
    borderColor: '#dee2e6',
    marginLeft: 8,
    paddingVertical: 2,
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 8,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c5aa0',
  },
  statLabel: {
    fontSize: 14,
    color: '#868e96',
  },
  editButton: {
    backgroundColor: '#2c5aa0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changePasswordButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2c5aa0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  changePasswordText: {
    color: '#2c5aa0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#6c757d',
    borderWidth: 1,
    borderColor: '#6c757d',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 0,
  },
  settingsText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordForm: {
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dc3545',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 30,
    width: '100%',
  },
  logoutText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
  },
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
  },
  navText: {
    fontSize: 26,
    color: '#444',
    fontWeight: '600',
    textAlign: 'center',
  },
});