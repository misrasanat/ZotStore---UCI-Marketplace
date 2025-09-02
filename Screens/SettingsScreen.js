import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';
import { Picker } from '@react-native-picker/picker';

export default function SettingsScreen({ navigation }) {
  const db = getFirestore();
  const user = auth.currentUser;
  const uid = user?.uid;
  const userRef = doc(db, 'users', uid || '');

  const [loading, setLoading] = useState(true);

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifListings, setNotifListings] = useState(true);
  const [notifReviews, setNotifReviews] = useState(true);

  // Privacy
  const [showPhone, setShowPhone] = useState(false);
  const [locationDetail, setLocationDetail] = useState('off'); // 'off' | 'area' | 'precise'

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
        setLocationDetail(s?.privacy?.locationDetail ?? 'off');
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
    await saveSettings({ privacy: { showPhone: value, locationDetail } });
  };
  const onChangeLocationDetail = async (value) => {
    setLocationDetail(value);
    await saveSettings({ privacy: { showPhone, locationDetail: value } });
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Theme</Text>
          <Text style={styles.placeholder}>Coming soon</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Enable Notifications</Text>
          <Switch value={notifEnabled} onValueChange={onToggleMasterNotif} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.subLabel}>Chat</Text>
          <Switch value={notifChat && notifEnabled} onValueChange={onToggleChat} disabled={!notifEnabled} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.subLabel}>Listings</Text>
          <Switch value={notifListings && notifEnabled} onValueChange={onToggleListings} disabled={!notifEnabled} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.subLabel}>Reviews</Text>
          <Switch value={notifReviews && notifEnabled} onValueChange={onToggleReviews} disabled={!notifEnabled} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Show Phone Number</Text>
          <Switch value={showPhone} onValueChange={onToggleShowPhone} />
        </View>
        <View style={styles.rowColumn}>
          <Text style={styles.label}>Location Detail</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={locationDetail} onValueChange={onChangeLocationDetail}>
              <Picker.Item label="Off" value="off" />
              <Picker.Item label="Area only" value="area" />
              <Picker.Item label="Precise" value="precise" />
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.helper}>ZotStore — UCI Marketplace</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 16,
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