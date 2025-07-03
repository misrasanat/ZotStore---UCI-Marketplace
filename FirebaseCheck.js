import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { getAuth } from 'firebase/auth';
import { auth } from './firebase';

export default function FirebaseCheck() {
  useEffect(() => {
    console.log('Auth loaded:', getAuth());
    console.log('Current user:', auth.currentUser);
  }, []);

  return (
    <View>
      <Text>Firebase Check</Text>
    </View>
  );
}