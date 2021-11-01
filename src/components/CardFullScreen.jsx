import React from 'react';
import {
  Text, View, StyleSheet,
} from 'react-native';

const CardFullScreen = ({ isOpen }) => (
  <View style={isOpen ? styles.open : styles.closed}>
    <Text>helo</Text>
  </View>
);

const styles = StyleSheet.create({
  open: {
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'blue',
    margin: 5,
    elevation: 1,
  },
  closed: {
    position: 'absolute',
    flex: 0,
    bottom: 0,
  },
});

export default CardFullScreen;
