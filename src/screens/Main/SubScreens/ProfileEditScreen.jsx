import React, { useState, useEffect } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import themeStyle from '../../../theme.style';
import apiCall from '../../../helpers/apiCall';
import ProfileVideoCamera from '../../../components/ProfileVideoCamera';
import PreviewVideo from '../../../components/PreviewVideo';

const ProfileEditScreen = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [initialProfileData, setInitialProfileData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);

  const [faceDetected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState('');

  const [registerationError, setRegisterationError] = useState('');

  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);

  const navigation = useNavigation();

  const handleFacesDetected = (obj) => {
    try {
      if (recording && obj.faces.length !== 0 && !faceDetected) {
        setFaceDetected(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async () => {
    const payload = {
      firstName,
      lastName,
      email,
      password,
      username,
      jobTitle,
      file: profileVideo ? {
        uri: profileVideo, name: 'profileVideo.mp4', type: 'video/mp4',
      } : null,
    };

    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
      if (payload[key]) {
        formData.append(key, payload[key]);
      }
    });
    setLoading(true);
    const { success, message, other } = await apiCall('POST', '/user/update/profile', formData);
    setLoading(false);
    if (!success) {
      // if (validationFailure = { type: 'email', exists: true })
      if (other?.validationError) {
        setValidationErrors(other.validationErrors);
      } else {
        setRegisterationError('Error, maybe network error.');
      }
    }
  };

  const handleSearch = async (query) => {
    setSearchInput(query);
    const { response } = await apiCall('GET', `/jobs/search/${query}`);
    if (response.length) {
      setResults(response);
    } else {
      setResults([]);
    }
  };

  const checkUserExists = async (type, identifier) => {
    const { response, success } = await apiCall('POST', '/user/check/exists', { type, identifier });
    if (success && response[type]) {
      setValidationErrors({ ...validationErrors, [type]: { exists: response[type].exists } });
    }
  };

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');

      setLoading(true);
      const { response, success } = await apiCall('GET', '/user/data');
      setLoading(false);
      if (success) {
        setInitialProfileData(
          response,
        );
        // setEmail(response.email);
        // setUsername(response.username);
        // setFirstName(response.firstName);
        // setLastName(response.lastName);
        // setProfileVideo(response.profileVideoUrl);
        // setProfileVideoHeaders(response.profileVideoHeaders);
      }
    })();
    return () => {
      setHasCameraPermission(false);
      setHasAudioPermission(false);
    };
  }, []);

  useEffect(() => {
    if (cameraActivated) {
      navigation.setOptions({ headerShown: false });
    } else {
      navigation.setOptions({ headerShown: true });
    }
  }, [cameraActivated]);

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
        setRecording={setRecording}
        setProfileVideo={setProfileVideo}
        setCameraActivated={setCameraActivated}
        setRecordingLength={setRecordingLength}
        handleFacesDetected={handleFacesDetected}
        recording={recording}
        recordingLength={recordingLength}
        hasCameraPermission={hasCameraPermission}
        hasAudioPermission={hasAudioPermission}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.formContainer}>
          {/* <View style={styles.searchSection}>
            <Ionicons
              style={styles.searchIcon}
              name="search"
              size={12}
              color={searchInput ? themeStyle.colors.grayscale.black
                : themeStyle.colors.grayscale.lightGray}
            />
            <TextInput
              style={styles.searchBar}
              placeholderTextColor="#b8b894"
              autoCorrect={false}
              placeholder="Search job titles..."
              onChangeText={(v) => handleSearch(v)}
              returnKeyType="search"
            />
            {results.map((result) => (
              <Text>{result.title}</Text>
            ))}
          </View> */}
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Job Title or Education</Text>
            <TextInput
              style={styles.visibleTextInputs}
              value={jobTitle}
              onChangeText={(v) => setJobTitle(v)}
            />
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Firstname</Text>
            <TextInput
              style={styles.visibleTextInputs}
              value={firstName}
              onChangeText={(v) => setFirstName(v)}
            />
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Lastname</Text>
            <TextInput
              style={styles.visibleTextInputs}
              value={lastName}
              onChangeText={(v) => setLastName(v)}
            />
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.visibleTextInputs, validationErrors.email?.exists && { borderColor: 'red' }]}
              value={email}
              onChangeText={(v) => setEmail(v)}
              onEndEditing={(e) => checkUserExists('email', e.nativeEvent.text)}
            />
            {validationErrors.email?.exists
              ? <Text style={styles.errorText}>This email already exists</Text> : null}
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.visibleTextInputs, validationErrors.username?.exists && { borderColor: 'red' }]}
              value={username}
              onChangeText={(v) => setUsername(v)}
              onEndEditing={(e) => checkUserExists('username', e.nativeEvent.text)}
            />
            {validationErrors.username?.exists
              ? <Text style={styles.errorText}>This username already exists</Text> : null}
          </View>
          <View style={styles.textInputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholderTextColor={themeStyle.colors.grayscale.lightGray}
                secureTextEntry={!showPassword}
                autoCorrect={false}
                value={password}
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
          </View>
          {(profileVideo && faceDetected)
           || (!profileVideo && initialProfileData.profileVideoHeaders
            && initialProfileData.profileVideoUrl) ? (
              <PreviewVideo
                uri={profileVideo
                || initialProfileData?.profileVideoUrl}
                headers={initialProfileData?.profileVideoHeaders}
              />
            ) : profileVideo ? (
              <View>
                <PreviewVideo
                  uri={profileVideo}
                />
                <Text style={styles.faceDetectionError}>
                  No face detected. Make sure your
                  face is shown at the start and end of
                  your profile video.
                </Text>
              </View>
            )
              : null}
          <TouchableOpacity
            style={styles.takeVideoButton}
            onPress={() => { setFaceDetected(false); setCameraActivated(true); }}
          >
            <Text style={styles.takeVideoButtonText}>
              <Ionicons
                name="videocam"
                size={14}
              />
              {' '}
              Update profile video
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerationButton}
            onPress={() => updateProfile()}
          >
            <Text style={styles.registerationButtonText}>
              Submit
              {' '}
              <Ionicons
                name="paper-plane-outline"
                size={14}
              />
            </Text>
          </TouchableOpacity>
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
    backgroundColor: themeStyle.colors.grayscale.white,
  },
  formContainer: {
    padding: 20,
    backgroundColor: themeStyle.colors.grayscale.white,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  formHeader: {
    fontSize: 20,
  },
  registerationError: {
    textAlign: 'center',
    color: themeStyle.colors.error.default,
    fontWeight: '500',
  },
  faceDetectionError: {
    color: themeStyle.colors.error.default,
    textAlign: 'center',
    fontWeight: '700',
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
  textInputContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  registerationButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 20,
    borderRadius: 50,
    backgroundColor: themeStyle.colors.primary.default,
  },
  registerationButtonText: {
    color: themeStyle.colors.grayscale.white,
  },
  takeVideoButton: {
    margin: 10,
    padding: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
    borderRadius: 5,
  },
  takeVideoButtonText: {
    color: themeStyle.colors.grayscale.black,
    fontWeight: '700',
  },
  text: {
    fontSize: 18,
    color: 'white',
  },
  errorText: {
    fontSize: 12,
    color: themeStyle.colors.error.default,
  },
  visibleTextInputs: {
    fontSize: 15,
    height: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: themeStyle.colors.grayscale.black,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    height: 45,
    borderRadius: 5,
    marginBottom: 20,
    padding: 5,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: themeStyle.colors.primary.default,
  },
  eyeIcon: {
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  searchBar: {
    flex: 1,
    color: themeStyle.colors.grayscale.black,
  },
  searchSection: {
    flexDirection: 'row',
  },
  searchIcon: {
    padding: 10,
  },
  userResult: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});

export default ProfileEditScreen;
