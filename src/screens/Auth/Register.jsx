import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, StyleSheet, Button, Text, TouchableOpacity,
  Dimensions, Platform, ScrollView, ActivityIndicator,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import * as FaceDetector from 'expo-face-detector';
import themeStyle from '../../theme.style';
import apiCall from '../../helpers/apiCall';
import ProfileVideoCamera from '../../components/ProfileVideoCamera';

const RegisterationScreen = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);

  const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
  const [faceDectected, setFaceDetected] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.front);

  const [profileVideo, setProfileVideo] = useState('');
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);
  const profileVideoRef = useRef(null);

  const [registerationError, setRegisterationError] = useState('');
  const navigation = useNavigation();

  const handleRecordClick = async () => {
    if (!recording) {
      setRecordingLength(15);
      setRecording(true);
      setTimeout(async () => {
        const video = await cameraRef.recordAsync();
        setProfileVideo(video.uri);
      }, 500);
    } else {
      setRecording(false);
      cameraRef.stopRecording();
      setCameraActivated(false);
    }
  };

  const validateUserInformation = () => {
    if (firstName
      && lastName
      && email
      && username
      && password
       && profileVideo && faceDectected) {
      return true;
    }
    return false;
  };

  const handleFacesDetected = (obj) => {
    try {
      if (recording && obj.faces.length !== 0 && !faceDectected) {
        setFaceDetected(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const registerUser = async () => {
    const payload = {
      firstName,
      lastName,
      email,
      password,
      username,
      file: {
        uri: profileVideo, name: 'profileVideo.mp4', type: 'video/mp4',
      },
    };
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      formData.append(key, payload[key]);
    });
    setLoading(true);
    const { success, message } = await apiCall('POST', '/user/register', formData);
    console.log(message);
    setLoading(false);
    if (success) {
      navigation.navigate('Login');
    } else if (message === 'exists') {
      setRegisterationError('A user already exists with this Email Address.');
    } else {
      setRegisterationError('Error, maybe network error.');
    }
  };

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');
    })();
    return () => {
      setHasCameraPermission(false);
      setHasAudioPermission(false);
    };
  }, []);

  useEffect(() => {
    let length = recordingLength;
    const interval = setInterval(() => {
      if (recording && length > 0) {
        length -= 1;
        setRecordingLength(length);
      }

      if (recording && length === 0) {
        setRecording(false);
        cameraRef.stopRecording();
        setCameraActivated(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [recording]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={themeStyle.colors.primary.default} />
      </View>
    );
  }

  if (cameraActivated) {
    return (
      <ProfileVideoCamera
        recording={recording}
        setRecording={setRecording}
        setProfileVideo={setProfileVideo}
        setCameraActivated={setCameraActivated}
        recordingLength={recordingLength}
        setRecordingLength={setRecordingLength}
        hasCameraPermission={hasCameraPermission}
        hasAudioPermission={hasAudioPermission}
        handleFacesDetected={handleFacesDetected}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          <TextInput
            style={styles.visibleTextInputs}
            value={firstName}
            placeholder="FirstName..."
            onChangeText={(v) => setFirstName(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={lastName}
            placeholder="LastName..."
            onChangeText={(v) => setLastName(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={email}
            placeholder="Email..."
            onChangeText={(v) => setEmail(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={username}
            placeholder="Username..."
            onChangeText={(v) => setUsername(v)}
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholderTextColor={themeStyle.colors.grayscale.lightGray}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              placeholder="Password..."
              onChangeText={(v) => setPassword(v)}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={19}
              />
            </TouchableOpacity>
          </View>
          {profileVideo && faceDectected ? (
            <TouchableOpacity
              style={{
                alignSelf: 'center',
              }}
              onPress={() => (profileVideoPlaying.isPlaying
                ? profileVideoRef.current.pauseAsync() : profileVideoRef.current.playAsync())}
            >
              <Video
                style={{
                  transform: [
                    { scaleX: -1 },
                  ],
                  alignSelf: 'center',
                  width: screenWidth / 1.5,
                  height: (screenWidth * 1.33) / 1.5,
                  borderWidth: 2,
                  borderColor: themeStyle.colors.primary.default,
                  borderRadius: 10,
                }}
                onPlaybackStatusUpdate={(status) => setProfileVideoPlaying(() => status)}
                ref={profileVideoRef}
                source={{
                  uri: profileVideo,
                }}
                isLooping
                resizeMode="cover"
              />
              {!profileVideoPlaying.isPlaying
                ? (
                  <View style={{
                    position: 'absolute',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: screenWidth / 1.5,
                    height: (screenWidth * 1.33) / 1.5,
                    borderWidth: 2,
                    borderColor: themeStyle.colors.primary.default,
                    borderRadius: 10,
                    backgroundColor: '#000',
                    opacity: 0.5,
                  }}
                  >
                    <Text style={{
                      flex: 1,
                      position: 'absolute',
                      fontSize: 20,
                      textAlign: 'center',
                      width: screenWidth / 1.5,
                      color: '#fff',
                    }}
                    >
                      Tap to preview
                    </Text>
                  </View>
                )
                : null}
            </TouchableOpacity>
          ) : profileVideo ? (
            <Text>
              No face detected. Make sure your
              face is shown at the start and end of
              your profile video.
            </Text>
          )
            : null}
          <Button title="Register" onPress={() => registerUser()} disabled={!validateUserInformation()} />
          <Button title={profileVideo ? 'Retake profile video' : 'Take profile video'} onPress={() => { setFaceDetected(false); setCameraActivated(true); }} />
          {registerationError
            ? <Text style={styles.registerationError}>{registerationError}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    backgroundColor: '#000',
    flex: 1,
  },
  registerationError: {
    textAlign: 'center',
    color: 'red',
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    flex: 0.1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  visibleTextInputs: {
    fontSize: 15,
    height: 45,
    borderRadius: 5,
    alignSelf: 'stretch',
    marginVertical: 20,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    height: 45,
    borderRadius: 5,
    alignSelf: 'stretch',
    marginVertical: 20,
    padding: 5,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  eyeIcon: {
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
});

export default RegisterationScreen;
