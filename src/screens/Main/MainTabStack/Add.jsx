import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Button, Image, Keyboard,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Constants from 'expo-constants';
import { useDispatch } from 'react-redux';
import { Video } from 'expo-av';
import themeStyle from '../../../theme.style';
import apiCall from '../../../helpers/apiCall';
import CameraStandard from '../../../components/CameraStandard';

const { statusBarHeight } = Constants;

const AddScreen = () => {
  const isFocused = useIsFocused();
  const [postBody, setPostBody] = useState('');
  const [error, setError] = useState(null);
  const [file, setFile] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const createPostData = async () => {
    const postData = new FormData();
    if (file.uri) {
      const {
        type, name, uri, orientation, isSelfie,
      } = file;
      postData.append('file', {
        type, name, uri,
      });
      postData.append('mediaOrientation', orientation);
      postData.append('mediaIsSelfie', isSelfie);
    }

    if (postBody) {
      postData.append('postBody', postBody);
    }

    return postData;
  };

  const createPost = async () => {
    const postData = await createPostData();
    const { success } = await apiCall('POST', '/posts/new', postData);
    if (success) {
      setPostBody('');
      setFile('');
      dispatch({ type: 'SET_POST_CREATED', payload: true });
      navigation.navigate('Home');
    } else {
      setError({ title: "Well... that wasn't supposed to happen!", message: 'An error occured creating your post.' });
    }
  };

  if (cameraActive && isFocused) {
    return (
      <CameraStandard
        recording={recording}
        setCameraActive={setCameraActive}
        setFile={setFile}
        setRecording={setRecording}
      />
    );
  }
  return (
    <View style={styles.container}>
      <Button title="Done" onPress={() => Keyboard.dismiss()} />
      {postBody.length >= 1000 - 25 ? (
        <Text style={styles.postLimitMessage}>
          {1000 - postBody.length}
          {' '}
          Characters Remaining
        </Text>
      ) : null}
      {
        file.type?.split('/')[0] === 'video'
          ? (
            <Video
              style={{
                alignSelf: 'center',
                width: 320,
                height: 200,
                backgroundColor: themeStyle.colors.grayscale.black,
              }}
              source={{
                uri: file.uri,
              }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
          )
          : file.type?.split('/')[0] === 'image'
            ? (
              <View style={{
                transform: [{
                  rotate: file.orientation === 'landscape-left' ? '-90deg'
                    : file.orientation === 'landscape-right' ? '90deg' : '0deg',
                }],
              }}
              >
                <Image style={{ width: 300, height: 300, margin: 20 }} source={{ uri: file.uri }} />
              </View>
            )
            : null
        }
      <TextInput
        style={{ minHeight: 100, textAlignVertical: 'top' }}
        value={postBody}
        placeholder="What's on your mind?"
        placeholderTextColor={themeStyle.colors.grayscale.lightGray}
        multiline
        maxLength={1000}
        onChangeText={(v) => setPostBody(v)}
      />
      <Button title="Camera" onPress={() => setCameraActive(true)} />
      <Button
        disabled={!postBody && !file}
        title="Make Post"
        onPress={() => createPost()}
      />
      {error ? (
        <View>
          <Text style={styles.errorTitle}>{error.title}</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
        </View>
      ) : null}

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    paddingTop: statusBarHeight,
  },
  postLimitMessage: {
    alignSelf: 'flex-end',
    color: themeStyle.colors.error.default,
  },
  errorTitle: {
    textAlign: 'center',
    color: themeStyle.colors.error.default,
    fontSize: 16,
  },
  errorMessage: {
    textAlign: 'center',
    color: themeStyle.colors.error.default,
    fontSize: 14,
  },
});

export default AddScreen;
