import React from "react";
import { Video } from "expo-av";
import { View, Text } from "react-native";

const TestVideo = ({ uri, color = "red" }) => {
  return (
    <View style={{ flex: 1, backgroundColor: color }}>
      {color === "blue" ? <Text>hello</Text> : null}
      <Video
        style={{
          aspectRatio: 1,
          width: "100%",
        }}
        source={{
          uri,
        }}
        useNativeControls
      />
    </View>
  );
};

export default TestVideo;
