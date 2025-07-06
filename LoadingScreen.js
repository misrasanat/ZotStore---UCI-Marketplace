import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0064a4" />
      <Text style={styles.text}>Loading ZotStore...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
  },
  text: {
    marginTop: 16,
    fontSize: 18,
    color: '#0064a4',
    fontWeight: '600',
  },
}); 