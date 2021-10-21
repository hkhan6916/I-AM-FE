import React, { useState, useEffect } from 'react';
import {
  Text, View, TouchableOpacity, Dimensions,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { DeviceMotion } from 'expo-sensors';
import themeStyle from '../theme.style';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const CameraStandard = ({
  setCameraActive, recording, setFile, setRecording,
}) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [orientation, setOrientation] = useState('portrait');
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    DeviceMotion.addListener(({ rotation }) => {
      const alpha = Math.abs(rotation?.alpha);
      const orientationVal = () => {
        if (alpha > 0 && alpha < 0.5) {
          return 'landscape-left';
        }

        if (alpha > 2 && alpha < 3) {
          return 'landscape-right';
        }

        return 'potrait';
      };
      setOrientation(
        // alpha > 3 || (alpha > 0 && alpha < 0.5) ? 'landscape' : 'portrait',
        orientationVal(),
      );
    });
    return () => {
      DeviceMotion.removeAllListeners();
      setHasPermission(false);
      setCameraActive(false);
      setCameraRef(null);
    };
  }, []);
  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: themeStyle.colors.grayscale.black }}>
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
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            justifyContent: 'flex-end',
            // alignItems: 'center',
          }}
        >
          <View style={{
            // display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
          >
            <TouchableOpacity
              style={{
                // flex: 0.1,
                width: 50,
                alignSelf: 'flex-end',
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
            <TouchableOpacity
              style={{ alignSelf: 'center', width: 50 }}
              onPress={async () => {
                if (cameraRef) {
                  const photo = await cameraRef.takePictureAsync();
                  const re = /(?:\.([^.]+))?$/;
                  const fileExtension = re.exec(photo.uri)[1];
                  setFile({
                    type: `image/${fileExtension}`, name: `${'media.'}${fileExtension}`, uri: photo.uri, orientation,
                  });
                  console.log(orientation);
                  setCameraActive(false);
                }
              }}
            >
              <View style={{
                borderWidth: 2,
                borderRadius: 25,
                borderColor: 'white',
                height: 50,
                width: 50,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              >
                <View style={{
                  borderWidth: 2,
                  borderRadius: 25,
                  borderColor: 'white',
                  height: 40,
                  width: 40,
                  backgroundColor: 'white',
                }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignSelf: 'center', width: 50 }}
              onPress={async () => {
                if (!recording) {
                  setRecording(true);
                  const video = await cameraRef.recordAsync();
                  setFile({
                    type: 'video/mp4', name: 'media.mp4', uri: video.uri, orientation,
                  });
                } else {
                  setRecording(false);
                  setCameraActive(false);
                  cameraRef.stopRecording();
                }
              }}
            >
              <View style={{
                borderWidth: 2,
                borderRadius: 25,
                borderColor: 'red',
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
                      borderColor: 'red',
                      height: 25,
                      width: 25,
                      backgroundColor: 'red',
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
      </Camera>
    </View>
  );
};

export default CameraStandard;
