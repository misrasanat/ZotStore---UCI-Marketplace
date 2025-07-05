import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth, signOut } from './firebase';
import { useAuth } from './AuthContext';
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Profile({ navigation }) {
  // const { userProfile } = useAuth();

  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;
  const uid = user?.uid;  
  const userRef = doc(db, 'users', uid);

  // Mock stats (keeping these for now as requested)
  const listings = 5;
  const sold = 2;
  const bought = 3;

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!uid) return;
      
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || '');
          setPhone(userData.phone || '');
          setBio(userData.bio || '');
      
          if (userData.profilePicUrl) {
            setProfilePic(userData.profilePicUrl);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        Alert.alert('Error', 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
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
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!uid) return;
    
    try {
      let profilePicUrl = null;
      if (profilePic && !profilePic.startsWith('http')) {
        const response = await fetch(profilePic);
        const blob = await response.blob();
        const storageRef = ref(storage, `profilePics/${uid}`);
        
        await uploadBytes(storageRef, blob);
        profilePicUrl = await getDownloadURL(storageRef);
      } else if (profilePic && profilePic.startsWith('http')) {
        // If it's already a URL, keep it
        profilePicUrl = profilePic;
      }
      
      // Update Firestore with user data and profile picture URL
      await setDoc(userRef, {
        name: name,
        phone: phone,
        bio: bio,
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
      // Navigation will be handled automatically by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleAdditionalSettings = () => {
    // TODO: Add real additional settings logic
    Alert.alert('Prompt to settings page!');
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture & Name */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profilePic ? { uri: profilePic } : require('./assets/icon.png')}
            style={styles.avatar}
            defaultSource={require('./assets/icon.png')}
          />
          {isEditing && <Text style={styles.editPhotoText}>Edit Photo</Text>}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
          />
        ) : (
          <Text style={styles.name}>{loading ? 'Loading...' : (name || 'No name set')}</Text>
        )}
        <Text style={styles.email}>{user?.email || 'Loading...'}</Text>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone:</Text>
          {isEditing ? (
            <TextInput
              style={styles.infoInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={styles.infoValue}>{loading ? 'Loading...' : (phone || 'Not set')}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bio:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.infoInput, { height: 60 }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Short bio"
              multiline
            />
          ) : (
            <Text style={styles.infoValue}>{loading ? 'Loading...' : (bio || 'No bio set')}</Text>
          )}
        </View>
      </View>

      {/* Marketplace Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Marketplace Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{listings}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{sold}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{bought}</Text>
            <Text style={styles.statLabel}>Bought</Text>
          </View>
        </View>
      </View>

      {/* Edit Profile & Change Password */}
      <View style={styles.section}>
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changePasswordButton} onPress={() => setShowPasswordForm(!showPasswordForm)}>
              <Text style={styles.changePasswordText}>Change Password</Text>
            </TouchableOpacity>
            {showPasswordForm && (
              <View style={styles.passwordForm}>
                <TextInput
                  style={styles.infoInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Current Password"
                  secureTextEntry
                />
                <TextInput
                  style={styles.infoInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="New Password"
                  secureTextEntry
                />
                <TextInput
                  style={styles.infoInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm New Password"
                  secureTextEntry
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                  <Text style={styles.saveButtonText}>Save Password</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.settingsButton} onPress={handleAdditionalSettings}>
              <Text style={styles.settingsText}>Additional Settings</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
    </ScrollView>
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.navText}>🏠</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
              <Text style={styles.navText}>📬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
              <Text style={styles.navText}>📦</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.navText}>👤</Text>
          </TouchableOpacity>
        </View>
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
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
    width: 60,
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#495057',
    marginLeft: 8,
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
        height: 60,
        backgroundColor: '#fdfff5',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
