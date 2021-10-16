import React, { useState, useEffect } from 'react';
import {
  View, TextInput, StyleSheet, Button, Text, TouchableOpacity,
  Dimensions, Platform, ScrollView, ActivityIndicator,
} from 'react-native';

import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as FaceDetector from 'expo-face-detector';
import themeStyle from '../theme.style';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const ProfileVideoCamera = ({
  recording,
  setRecording,
  setProfileVideo,
  setCameraActivated,
  recordingLength,
  setRecordingLength,
  hasCameraPermission,
  hasAudioPermission,
  handleFacesDetected,
}) => {
  const [cameraRef, setCameraRef] = useState(null);

  const [type, setType] = useState(Camera.Constants.Type.front);
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

  return (
    <View style={{
      flex: 1,
      backgroundColor: '#000',
    }}
    >
      {hasCameraPermission && hasAudioPermission
        ? (
          <Camera
            mirror
            style={{
              width: screenWidth,
              height: screenWidth * 1.33,
              marginTop: (screenHeight - screenWidth * 1.33) / 2,
              marginBottom: (screenHeight - screenWidth * 1.33) / 2,
            }}
            ratio="4:3"
            type={type}
            ref={(ref) => {
              setCameraRef(ref);
            }}
            onFacesDetected={(e) => handleFacesDetected(e)}
            faceDetectorSettings={{
              mode: FaceDetector.Constants.Mode.fast,
              detectLandmarks: FaceDetector.Constants.Landmarks.none,
              runClassifications: FaceDetector.Constants.Classifications.none,
              minDetectionInterval: 100,
              tracking: true,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                justifyContent: 'flex-end',
              }}
            >
              <Text>{recordingLength}</Text>
              <View style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}
              >
                <View style={{
                  flex: 0.3,
                }}
                >
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    onPress={() => {
                      setType(
                        type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                      );
                    }}
                  >
                    <Ionicons name="camera-reverse-outline" size={40} color={themeStyle.colors.grayscale.white} />
                  </TouchableOpacity>
                </View>
                <View style={{
                  flex: 0.5,
                }}
                >
                  <TouchableOpacity
                    style={{
                      width: 50,
                      height: 50,
                    }}
                    disabled={recording && recordingLength > 12}
                    onPress={() => handleRecordClick()}
                  >
                    <View style={{
                      borderWidth: 2,
                      borderRadius: 25,
                      borderColor: recording && recordingLength > 12 ? 'grey' : 'red',
                      height: 50,
                      width: 50,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    >
                      {recording
                        ? (
                          <View style={{
                            borderWidth: 2,
                            borderRadius: 5,
                            borderColor: recordingLength > 12 ? 'grey' : 'red',
                            height: 25,
                            width: 25,
                            backgroundColor: recordingLength > 12 ? 'grey' : 'red',
                          }}
                          />
                        ) : (
                          <View style={{
                            borderWidth: 2,
                            borderRadius: 25,
                            borderColor: 'red',
                            height: 40,
                            width: 40,
                            backgroundColor: 'red',
                          }}
                          />
                        )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Camera>
        )
        : (
          <View>
            <Text>
              Please enable camera and audio permissions to record a profile video.
            </Text>
          </View>
        )}
    </View>
  );
};

export default ProfileVideoCamera;
