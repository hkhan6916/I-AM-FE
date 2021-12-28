import React, { useState, useEffect, useRef } from 'react';
import {
  View, TextInput, Text, TouchableOpacity,
  Dimensions, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { getExpoPushTokenAsync } from 'expo-notifications';
import themeStyle from '../../../theme.style';
import apiCall from '../../../helpers/apiCall';
import ProfileVideoCamera from '../../../components/ProfileVideoCamera';

const ProfileEditScreen = () => {
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [initialProfileData, setInitialProfileData] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(null);

  const [cameraActivated, setCameraActivated] = useState(false);

  const [recording, setRecording] = useState(false);
  const [recordingLength, setRecordingLength] = useState(15);

  const { width: screenWidth } = Dimensions.get('window');
  const [faceDectected, setFaceDetected] = useState(false);

  const [profileVideo, setProfileVideo] = useState('');
  const [profileVideoHeaders, setProfileVideoHeaders] = useState({});
  const [profileVideoPlaying, setProfileVideoPlaying] = useState(false);
  const profileVideoRef = useRef(null);

  const [registerationError, setRegisterationError] = useState('');

  const [searchInput, setSearchInput] = useState();
  const [results, setResults] = useState([]);
  const [details, setDetails] = useState({});
  const [successful, setSuccessful] = useState(false);

  const navigation = useNavigation();

  const handleFacesDetected = (obj) => {
    try {
      if (recording && obj.faces.length !== 0 && !faceDectected) {
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
    console.log(formData);
    const { success, message } = await apiCall('POST', '/user/update/profile', formData);
    console.log(message);
    if (success) {
      setLoading(false);
    } else {
      setLoading(false);
      setRegisterationError('Error, maybe network error.');
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

  const handleProfileUpdate = async () => {
    const { success } = await apiCall('PATCH', '/user/update/profile', { details });

    setSuccessful(success);
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
              color={searchInput ? '#000' : '#b8b894'}
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
          <TextInput
            style={styles.visibleTextInputs}
            value={firstName || initialProfileData.firstName}
            placeholder="FirstName..."
            onChangeText={(v) => setFirstName(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={lastName || initialProfileData.lastName}
            placeholder="LastName..."
            onChangeText={(v) => setLastName(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={email || initialProfileData.email}
            placeholder="Email..."
            onChangeText={(v) => setEmail(v)}
          />
          <TextInput
            style={styles.visibleTextInputs}
            value={username || initialProfileData.username}
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
          {(profileVideo && faceDectected) || (initialProfileData.profileVideoHeaders && initialProfileData.profileVideoUrl) ? (
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
                  uri: profileVideo || initialProfileData?.profileVideoUrl,
                  headers: initialProfileData?.profileVideoHeaders,
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
            <Text style={styles.faceDetectionError}>
              No face detected. Make sure your
              face is shown at the start and end of
              your profile video.
            </Text>
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
              {profileVideo ? 'Retake profile video' : 'Take profile video'}
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
    color: themeStyle.colors.grayscale.black,
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
  searchBar: {
    flex: 1,
    color: '#000',
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

// import React, { useState } from 'react';
// import {
//   View, Text, Button, StyleSheet, ScrollView, TextInput,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import apiCall from '../../../helpers/apiCall';

// const ProfileEdit = () => {
//   const [searchInput, setSearchInput] = useState();
//   const [results, setResults] = useState([]);
//   const [details, setDetails] = useState({});
//   const [successful, setSuccessful] = useState(false);

//   const handleSearch = async (query) => {
//     setSearchInput(query);
//     const { response } = await apiCall('GET', `/jobs/search/${query}`);
//     if (response.length) {
//       setResults(response);
//     } else {
//       setResults([]);
//     }
//   };

//   const handleProfileUpdate = async () => {
//     const { success } = await apiCall('PATCH', '/user/update/profile', { details });

//     setSuccessful(success);
//   };
//   // Option to update profile video
//   // option to update firstname
//   // option to update username
//   // option to update password
//   return (
//     <ScrollView>
//       <View style={styles.searchSection}>
//         <Ionicons
//           style={styles.searchIcon}
//           name="search"
//           size={12}
//           color={searchInput ? '#000' : '#b8b894'}
//         />
//         <TextInput
//           style={styles.searchBar}
//           placeholderTextColor="#b8b894"
//           autoCorrect={false}
//           placeholder="Search job titles..."
//           onChangeText={(v) => handleSearch(v)}
//           returnKeyType="search"
//         />
//         {results.map((result) => (
//           <Text>{result.title}</Text>
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   searchBar: {
//     flex: 1,
//     color: '#000',
//   },
//   searchSection: {
//     flexDirection: 'row',
//   },
//   searchIcon: {
//     padding: 10,
//   },
//   userResult: {
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
// });

// export default ProfileEdit;
