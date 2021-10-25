import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Constants from 'expo-constants';
import themeStyle from '../../../theme.style';

const { statusBarHeight } = Constants;

const HomeScreen = () => {
  const dispatch = useDispatch();
  const newPostCreated = useSelector((state) => state.postCreated);

  useEffect(() => {
    if (newPostCreated.state) {
      setTimeout(() => {
        dispatch({ type: 'SET_POST_CREATED', payload: false });
      }, 3000);
    }
  }, [newPostCreated]);
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
      {newPostCreated.state ? (

        <Text style={styles.newPostPill}>Post created</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  newPostPill: {
    backgroundColor: themeStyle.colors.primary.default,
    color: themeStyle.colors.grayscale.white,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    marginTop: statusBarHeight + 10,
  },
});

export default HomeScreen;
