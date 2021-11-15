import React, { useRef, useState, useEffect } from 'react';
import {
  View, StyleSheet, TouchableWithoutFeedback, Text, Dimensions, Button, ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import themeStyle from '../theme.style';
import useScreenOrientation from '../helpers/hooks/useScreenOrientation';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const VideoPlayer = ({ url, isFullScreen }) => {
  const video = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [videoProgress, setVideoProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState({});
  const navigation = useNavigation();
  const progressBarWidth = screenWidth - 170;

  const ScreenOrientation = useScreenOrientation();

  const handleStatusChange = async (status) => {
    setVideoStatus(status);
    if (videoStatus?.positionMillis && videoStatus?.durationMillis) {
      setVideoProgress((videoStatus?.positionMillis / videoStatus?.durationMillis));
    }
  };

  const handleProgressPress = async (e) => {
    const position = e.nativeEvent.locationX;
    const progress = ((position / progressBarWidth)) * videoStatus.durationMillis;
    await video.current.setPositionAsync(progress);
  };

  const handleVideoState = async () => {
    const videoEnded = videoStatus.positionMillis && videoStatus.durationMillis
      && videoStatus.positionMillis === videoStatus.durationMillis;

    if (videoStatus.isPlaying) {
      await video.current.pauseAsync();
      if (showControls) {
        setTimeout(() => {
          setShowControls(false);
        }, 5000);
      }
    } else if (videoEnded) {
      await video.current.setPositionAsync(0);
      await video.current.playAsync();
    } else {
      await video.current.playAsync();
    }
  };

  const handleVideoDuration = (duration) => {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? `0${hours}` : hours;
    minutes = (minutes < 10) ? `0${minutes}` : minutes;
    seconds = (seconds < 10) ? `0${seconds}` : seconds;

    return `${hours > 0 ? `${hours}:` : ''}${minutes}:${seconds}`;
  };

  const handleShowControls = () => {
    setShowControls(!showControls);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', async () => {
      if (video) {
        await video.current?.pauseAsync();
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleVideoAspectRatio = () => {
    if (ScreenOrientation === 'LANDSCAPE') {
      return videoDimensions.height / videoDimensions.width;
    } return videoDimensions.width / videoDimensions.height;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableWithoutFeedback onPress={() => handleShowControls()}>
          <Video
            onReadyForDisplay={(params) => {
              setVideoDimensions(params.naturalSize);
            }}
            ref={video}
            style={[styles.video, {
            //   backgroundColor: 'red',
              aspectRatio: handleVideoAspectRatio() || 1,

              width: ScreenOrientation === 'PORTRAIT' ? screenWidth : screenHeight,
            //   height: '100%',
            //   width: '100%',
            }]}
            source={{
            //   uri: url,
              uri: 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4', // url,
            }}
            useNativeControls={false}
            // resizeMode="stretch"
            resizeMode={isFullScreen ? 'contain' : 'cover'}
            onPlaybackStatusUpdate={(status) => handleStatusChange(status)}
          />
        </TouchableWithoutFeedback>

      </View>
      {showControls
        ? (
          <TouchableWithoutFeedback
            onPress={() => handleVideoState()}
          >
            <View style={{ position: 'absolute', backgroundColor: themeStyle.colors.grayscale.black, borderRadius: 100 }}>
              <MaterialCommunityIcons
                name={videoStatus.isPlaying ? 'pause' : 'play'}
                size={60}
                color={themeStyle.colors.grayscale.white}
              />
            </View>
          </TouchableWithoutFeedback>
        )
        : null}
      {showControls && videoStatus?.positionMillis && videoStatus?.durationMillis
        ? (
          <View style={styles.controls}>
            <Text style={styles.durationStyles}>
              {handleVideoDuration(videoStatus?.positionMillis)}
            </Text>
            <Slider
              style={{ width: progressBarWidth, height: 40 }}
              minimumValue={0}
              value={videoStatus?.positionMillis}
              maximumValue={videoStatus?.durationMillis}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
              tapToSeek
              onSlidingComplete={async (value) => {
                await video.current.setPositionAsync(value);
              }}
            />
            <Text style={styles.durationStyles}>
              {handleVideoDuration(videoStatus?.durationMillis)}
            </Text>
            {!isFullScreen
              ? <Button title="fullscreen" onPress={() => navigation.navigate('VideoScreen', { url })} />
              : null}
          </View>
        ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    borderRadius: 10,
    // margin: 0,
    // alignSelf: 'center',
    // height: screenWidth,
    // aspectRatio: 1,
    // width: screenWidth,
    // height: screenHeight,
  },
  buttons: {
    marginTop: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    height: 48,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  durationStyles: {
    fontWeight: '500',
    color: themeStyle.colors.grayscale.white,
  },
});

export default VideoPlayer;
