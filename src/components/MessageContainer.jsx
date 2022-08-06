import React from "react";
import { View, Text, StyleSheet } from "react-native";
import themeStyle from "../theme.style";
import MessageBox from "./MessageBox";

const MessageContainer = ({
  message,
  messageDate,
  firstMessageDate,
  belongsToSender,
  mediaSize,
  cancelUpload,
  isWeb,
}) => {
  return (
    <View style={{ width: "100%", transform: [{ scaleY: !isWeb ? -1 : 1 }] }}>
      {messageDate ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.horizontalLines} />
          <Text
            style={{
              textAlign: "center",
              marginHorizontal: 10,
              color: themeStyle.colors.grayscale.low,
            }}
          >
            {messageDate}
          </Text>
          <View style={styles.horizontalLines} />
        </View>
      ) : null}
      {firstMessageDate ? (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.horizontalLines} />
          <Text
            style={{
              textAlign: "center",
              marginHorizontal: 10,
              color: themeStyle.colors.grayscale.low,
            }}
          >
            {firstMessageDate}
          </Text>
          <View style={styles.horizontalLines} />
        </View>
      ) : null}
      <MessageBox
        message={message}
        belongsToSender={belongsToSender}
        mediaSize={mediaSize}
        cancelUpload={cancelUpload}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalLines: {
    flex: 1,
    height: 1,
    backgroundColor: themeStyle.colors.grayscale.low,
  },
});

export default React.memo(MessageContainer);
