import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { auth, signOut } from '../firebase';
import { useTheme } from '../ThemeContext';
import { deleteUserAccount, showDeleteAccountConfirmation, showReauthenticationModal, reauthenticateUser } from '../utils/accountDeletion';

export default function SettingsScreen({ navigation }) {
  const db = getFirestore();
  const user = auth.currentUser;
  const uid = user?.uid;
  const userRef = doc(db, 'users', uid || '');
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Privacy
  const [showFullLocation, setShowFullLocation] = useState(false);

  // Security - change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadSettings = useCallback(async () => {
    if (!uid) return;
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        const s = data?.settings || {};
        const legacyDetail = s?.privacy?.locationDetail;
        setShowFullLocation(s?.privacy?.showFullLocation ?? (legacyDetail === 'precise'));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
      Alert.alert('Error', 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = useCallback(async (partial) => {
    if (!uid) return;
    try {
      await setDoc(userRef, { settings: partial }, { merge: true });
    } catch (e) {
      console.error('Failed to save settings', e);
      Alert.alert('Error', 'Failed to save settings.');
    }
  }, [uid]);

  // Handlers to save immediately on change
  const onToggleFullLocation = async (value) => {
    setShowFullLocation(value);
    await saveSettings({ privacy: { showFullLocation: value, locationDetail: deleteField() } });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert('Error', 'No authenticated user.');
        return;
      }
      // Re-authenticate
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Password changed successfully.');
    } catch (e) {
      console.error('Failed to change password', e);
      Alert.alert('Error', e?.message || 'Failed to change password.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const confirmed = await showDeleteAccountConfirmation(async () => {
        try {
          if (!uid || !user?.email) {
            Alert.alert('Error', 'User information not available.');
            return;
          }

          // Attempt to delete the account
          await deleteUserAccount(uid);
          
          // Sign out and navigate to Auth screen
          await signOut(auth);
          Alert.alert(
            'Account Deleted', 
            'Your account has been permanently deleted.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // The AuthContext will handle navigation automatically after signOut
                }
              }
            ]
          );
          
        } catch (error) {
          console.error('Delete account error:', error);
          
          if (error.message === 'REQUIRES_REAUTHENTICATION') {
            // Handle reauthentication requirement
            try {
              const password = await showReauthenticationModal(user.email);
              await reauthenticateUser(user.email, password);
              
              // Retry deletion after reauthentication
              await deleteUserAccount(uid);
              await signOut(auth);
              
              Alert.alert(
                'Account Deleted', 
                'Your account has been permanently deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // The AuthContext will handle navigation automatically after signOut
                    }
                  }
                ]
              );
              
            } catch (reauthError) {
              console.error('Reauthentication failed:', reauthError);
              Alert.alert(
                'Delete Failed', 
                'Failed to verify your identity. Please try logging out and back in, then try deleting your account again.'
              );
            }
          } else {
            Alert.alert(
              'Delete Failed', 
              'An error occurred while deleting your account. Please try again or contact support.'
            );
          }
        }
      });
      
    } catch (error) {
      console.error('Error in handleDeleteAccount:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Settings</Text>
          <View style={styles.backButton} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Appearance</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.text }]}>Dark Theme</Text>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDarkMode ? colors.buttonText : colors.text}
            />
          </View>
        </View>

        {/* NOTIFICATIONS SECTION - COMMENTED OUT UNTIL IMPLEMENTED
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionTitleContainer}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Notifications</Text>
            <Text style={[styles.comingSoonBadge, { backgroundColor: colors.primary, color: colors.textLight }]}>Coming Soon</Text>
          </View>
          <View style={[styles.rowBetween, { opacity: 0.5 }]}>
            <Text style={[styles.label, { color: colors.text }]}>Enable Notifications</Text>
            <Switch 
              value={false}
              onValueChange={() => {}}
              disabled={true}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={[styles.rowBetween, { opacity: 0.5 }]}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Chat</Text>
            <Switch 
              value={false}
              onValueChange={() => {}}
              disabled={true}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={[styles.rowBetween, { opacity: 0.5 }]}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Listings</Text>
            <Switch 
              value={false}
              onValueChange={() => {}}
              disabled={true}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
          <View style={[styles.rowBetween, { opacity: 0.5 }]}>
            <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Reviews</Text>
            <Switch 
              value={false}
              onValueChange={() => {}}
              disabled={true}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text}
            />
          </View>
        </View>
        */}

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Privacy</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.text }]}>Show Full Location</Text>
            <Switch 
              value={showFullLocation} 
              onValueChange={onToggleFullLocation}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={showFullLocation ? colors.buttonText : colors.text}
            />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Account</Text>
          <TouchableOpacity 
            style={[styles.deleteAccountButton, { backgroundColor: colors.error }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteAccountText, { color: colors.textLight }]}>
              Delete Account
            </Text>
          </TouchableOpacity>
          <Text style={[styles.deleteAccountWarning, { color: colors.textSecondary }]}>
            This action will permanently delete your account and all associated data. This cannot be undone.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 8, // reduced from 24
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
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
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  comingSoonBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowColumn: {
    paddingVertical: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    overflow: 'hidden',
    height: 200
  },
  label: {
    fontSize: 16,
    color: '#495057',
  },
  subLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  helper: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#495057',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteAccountWarning: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});