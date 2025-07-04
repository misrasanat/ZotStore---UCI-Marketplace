import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ text, fromSelf }) => {
  return (
    <View style={[styles.bubble, fromSelf ? styles.self : styles.other]}>
      <Text style={[styles.text, fromSelf && { color: '#fff' }]}>{text}</Text>
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