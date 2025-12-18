import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsAcceptance = ({ isAccepted, onToggle, theme }) => {
  const handleTermsPress = () => {
    Linking.openURL('https://square-scale-53e.notion.site/ZotStore-Terms-of-Service-End-User-License-Agreement-EULA-2cc2bbeb6fad805f8089ea30787af7e7');
  };

  const handlePrivacyPress = () => {
    // Update with actual privacy policy URL
    Linking.openURL('https://www.privacypolicies.com/live/af7501de-9bac-4b49-ba28-888b36ffc9e7');
  };

  // Safely access colors with fallback
  const colors = theme?.colors || {
    border: '#ccc',
    primary: '#0064a4',
    text: '#000'
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={[
          styles.checkbox, 
          { borderColor: colors.border },
          isAccepted && { backgroundColor: colors.primary }
        ]}>
          {isAccepted && (
            <Ionicons name="checkmark" size={16} color="white" />
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.textContainer}>
        <Text style={[styles.text, { color: colors.text }]}>
          I agree to the{' '}
          <Text style={[styles.link, { color: colors.primary }]} onPress={handleTermsPress}>
            Terms of Service and EULA
          </Text>
          {' '}and{' '}
          <Text style={[styles.link, { color: colors.primary }]} onPress={handlePrivacyPress}>
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
});

export default TermsAcceptance;
