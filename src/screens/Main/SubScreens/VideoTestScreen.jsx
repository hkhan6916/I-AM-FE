import React, { useState } from "react";
import { View, Text, Button, Modal } from "react-native";
import TestVideo from "../../../components/TestVideo";
const VideoTestScreen = () => {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ flex: 1 }}>
      <TestVideo
        color={visible ? "blue" : "red"}
        uri="https://dhahb2s08yybu.cloudfront.net/b26185d3-8bee-49e5-abd3-acec612a4e60.mp4?Expires=1644334119&Key-Pair-Id=APKAVUWLHDRFX53DTY4K&Signature=hqKKRo26MRfzXBbxMRWgWBtZow8vQ4w5mUu6tktEnTW9gRRX9HZBG5g6Dbpu-i0~HDnPe6SCKKc6SLEHGOrHvQCtNkks3IJm76WpWOVkEsRTlEN5KiwN5yLwGpAFhy1h3Dz8JNHcdnJ1h0pvQ32ostwBCuSaNv3ADFiIGKOYFWRa00VuzWlhjaDIHARMgwV6Uaedr45fLxv4gOX18vJ7-aglkxQ1zKnCz7bIU-Q2jU44UUrBdl0D~Z3Tidcg10z6OmRr9qcLAp-MygELLgNayNKUe1Q1V3SgOd55LBVG6vhKyrBDvcqaMqgc0gMJiJW2VCuPnLXSxy9dgHNFthNAbg__"
      />
      <Button onPress={() => setVisible(!visible)} title="toggle" />
    </View>
  );
};
export default VideoTestScreen;
