import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  // Mock user data
  const [profilePic, setProfilePic] = useState(null);
  const [name, setName] = useState('Peter Anteater');
  const [email] = useState('panteater@uci.edu');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('Zot! Marketplace enthusiast.');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mock stats
  const listings = 5;
  const sold = 2;
  const bought = 3;

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfilePic(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert('Profile updated!');
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

  const handleLogout = () => {
    // TODO: Add real logout logic
    Alert.alert('Logged out!');
  };

  const handleAdditionalSettings = () => {
    // TODO: Add real additional settings logic
    Alert.alert('Prompt to settings page!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture & Name */}
      <View style={styles.headerSection}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profilePic ? { uri: profilePic } : require('./assets/icon.png')}
            style={styles.avatar}
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
          <Text style={styles.name}>{name}</Text>
        )}
        <Text style={styles.email}>{email}</Text>
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
            <Text style={styles.infoValue}>{phone || 'Not set'}</Text>
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
            <Text style={styles.infoValue}>{bio}</Text>
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
});
