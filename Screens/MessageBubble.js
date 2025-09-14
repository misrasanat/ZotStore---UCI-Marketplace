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
    padding: 10,
    borderRadius: 16,
    marginVertical: 6,
  },
  self: {
    backgroundColor: '#194a7a',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  other: {
    backgroundColor: '#e5e5e5',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});

export default MessageBubble;