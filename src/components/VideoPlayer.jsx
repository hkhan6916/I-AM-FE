import React, { useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableWithoutFeedback, Text, Dimensions,
} from 'react-native';
import { Video } from 'expo-av';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

import themeStyle from '../theme.style';

const VideoPlayer = ({ url }) => {
  const video = useRef(null);
  const [videoStatus, setVideoStatus] = useState({});
  const [videoProgress, setVideoProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const { width: screenWidth } = Dimensions.get('window');

  const progressBarWidth = screenWidth - 170;

  const handleStatusChange = (status) => {
    setVideoStatus(status);
    if (videoStatus?.positionMillis && videoStatus?.durationMillis) {
      setVideoProgress((videoStatus?.positionMillis / videoStatus?.durationMillis));
    }
  };

  const handleReplay = async () => {
    await video.current.setPositionAsync(0);
    await video.current.playAsync();
  };

  const handleProgressPress = async (e) => {
    const position = e.nativeEvent.locationX;
    const progress = ((position / progressBarWidth)) * videoStatus.durationMillis;
    await video.current.setPositionAsync(progress);
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
  if (videoStatus?.positionMillis && videoStatus?.durationMillis) {
    return (
      <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
        <View style={styles.container}>
          <View>
            <Video
              ref={video}
              style={styles.video}
              source={{
                uri: url,
              }}
              useNativeControls={false}
              resizeMode="cover"
              onPlaybackStatusUpdate={(status) => handleStatusChange(status)}
            />
            {showControls
              ? (
                <View style={styles.controls}>
                  {/* <MaterialCommunityIcons name="arrow-expand-all" size={24} color="black" /> */}
                  <Text style={styles.durationStyles}>
                    {handleVideoDuration(videoStatus?.positionMillis)}
                  </Text>
                  <TouchableWithoutFeedback
                    style={{ position: 'absolute' }}
                    onPress={() => (videoStatus.isPlaying
                      ? video.current.pauseAsync()
                      : videoStatus?.positionMillis === videoStatus?.durationMillis
                        ? handleReplay() : video.current.playAsync())}
                  >
                    <MaterialCommunityIcons name={videoStatus.isPlaying ? 'pause' : videoStatus?.positionMillis === videoStatus?.durationMillis ? 'restart' : 'play'} size={24} color={themeStyle.colors.grayscale.white} />
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={(e) => handleProgressPress(e)}>
                    <View style={{
                      width: progressBarWidth,
                      height: 20,
                      backgroundColor: themeStyle.colors.grayscale.white,
                    }}
                    >
                      <View style={{ width: `${videoProgress * 100}%`, height: 20, backgroundColor: themeStyle.colors.secondary.default }} />
                    </View>
                  </TouchableWithoutFeedback>
                  <Text style={styles.durationStyles}>
                    {handleVideoDuration(videoStatus?.durationMillis)}
                  </Text>
                </View>
              )
              : null}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={() => setShowControls(!showControls)}>
      <View style={styles.container}>
        <View>
          <Video
            ref={video}
            style={styles.video}
            source={{
              uri: url,
            }}
            useNativeControls={false}
            resizeMode="cover"
            onPlaybackStatusUpdate={(status) => handleStatusChange(status)}
          />
          {showControls
            ? (
              <View style={styles.controls}>
                <TouchableWithoutFeedback
                  onPress={() => (videoStatus.isPlaying
                    ? video.current.pauseAsync() : video.current.playAsync())}
                >
                  <MaterialCommunityIcons name={videoStatus.isPlaying ? 'pause' : videoStatus?.positionMillis === videoStatus?.durationMillis ? 'restart' : 'play'} size={24} color={themeStyle.colors.grayscale.white} />
                </TouchableWithoutFeedback>
              </View>
            )
            : null}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  video: {
    alignSelf: 'center',
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1 / 1,
  },
  buttons: {
    marginTop: 200,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    height: 48,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
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
