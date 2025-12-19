import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';

const MessageBubble = ({ text, fromSelf }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.bubble, 
      fromSelf ? 
        [styles.self, { backgroundColor: colors.primary }] : 
        [styles.other, { backgroundColor: colors.surface }]
    ]}>
      <Text style={[
        styles.text, 
        { color: fromSelf ? colors.textLight : colors.text }
      ]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  self: {
    backgroundColor: '#0C2340',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
    shadowColor: '#0C2340',
    shadowOpacity: 0.15,
  },
  other: {
    backgroundColor: 'rgba(233, 236, 239, 0.9)',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  text: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});

export default MessageBubble;