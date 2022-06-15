import { Video } from "expo-av";
import React from "react";
import { View, Text } from "react-native";
import VideoPlayer from "../../../components/VideoPlayer";
const Test = () => {
  return (
    <View style={{ flex: 1 }}>
      <Text>
        <VideoPlayer
          url="https://dhahb2s08yybu.cloudfront.net/b26185d3-8bee-49e5-abd3-acec612a4e60.mp4?Expires=1644695022&Key-Pair-Id=APKAVUWLHDRFX53DTY4K&Signature=KdCKrRJBkCRRuU2rRcJJ6REgsMB45jP9G0aLvmuom3Y4uRWbMsXUZ~YA8wKtxyDO9izmov0fW09w1F-KFYDvRO3z8Yr0H0rkpUaXmdufDgw8PbzyAswP-uqtE8wSb5aavVE922bOoSFGk9n43QzgM4tXpYHUNQXBxzs4uBmNYk~TktpQuc7Xw4BME2Hnb0io4yIXEG6oKITQ2Dd2lkNejQCVk0BsTEhwJfVFGsYtQPKc~K-MM80PEYhFV~Ukbn0K4Fm9o6vEsgEZsP5Chsoz-1LbiVXwQP7lKjNVT59KvPPNyut36KQXlVFDmbextSwcIAUHyT~GoImP5xd4VqAT3g__"
          shouldPlay
        />
      </Text>
    </View>
  );
};
export default Test;
