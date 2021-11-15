import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  Button, ScrollView, TextInput, View,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import apiCall from '../../../helpers/apiCall';
import PostCard from '../../../components/PostCard';
import VideoPlayer from '../../../components/VideoPlayer';

const VideoScreen = (props) => {
  const { url } = props.route.params;
  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.DEFAULT);
    })();
    return async () => { await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT); };
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <VideoPlayer
        url={url}
        isFullScreen
      />
    </View>
  );
};

export default VideoScreen;
