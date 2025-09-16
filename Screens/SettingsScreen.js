import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, doc, getDoc, setDoc, deleteField } from 'firebase/firestore';
import { auth } from '../firebase';
import { useTheme } from '../ThemeContext';

export default function SettingsScreen({ navigation }) {
  const db = getFirestore();
  const user = auth.currentUser;
  const uid = user?.uid;
  const userRef = doc(db, 'users', uid || '');
  const { isDarkMode, toggleTheme, colors } = useTheme();

  const [loading, setLoading] = useState(true);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifListings, setNotifListings] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);

  // Privacy
  const [showPhone, setShowPhone] = useState(false);
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
        setNotifEnabled(s?.notifications?.enabled ?? true);
        setNotifChat(s?.notifications?.chat ?? true);
        setNotifListings(s?.notifications?.listings ?? true);
        setNotifReviews(s?.notifications?.reviews ?? true);
        setShowPhone(s?.privacy?.showPhone ?? false);
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
  const onToggleMasterNotif = async (value) => {
    setNotifEnabled(value);
    await saveSettings({ notifications: { enabled: value, chat: value && notifChat, listings: value && notifListings, reviews: value && notifReviews } });
  };
  const onToggleChat = async (value) => {
    setNotifChat(value);
    await saveSettings({ notifications: { enabled: notifEnabled, chat: value, listings: notifListings, reviews: notifReviews } });
  };
  const onToggleListings = async (value) => {
    setNotifListings(value);
    await saveSettings({ notifications: { enabled: notifEnabled, chat: notifChat, listings: value, reviews: notifReviews } });
  };
  const onToggleReviews = async (value) => {
    setNotifReviews(value);
    await saveSettings({ notifications: { enabled: notifEnabled, chat: notifChat, listings: notifListings, reviews: value } });
  };

  const onToggleShowPhone = async (value) => {
    setShowPhone(value);
    await saveSettings({ privacy: { showPhone: value, showFullLocation, locationDetail: deleteField() } });
  };
  const onToggleFullLocation = async (value) => {
    setShowFullLocation(value);
    await saveSettings({ privacy: { showPhone, showFullLocation: value, locationDetail: deleteField() } });
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

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Privacy</Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.label, { color: colors.text }]}>Show Phone Number</Text>
            <Switch 
              value={showPhone} 
              onValueChange={onToggleShowPhone}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={showPhone ? colors.buttonText : colors.text}
            />
          </View>
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
});