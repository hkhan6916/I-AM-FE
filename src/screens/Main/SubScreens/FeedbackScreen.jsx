import React from "react";
import { Text, View } from "react-native";
import TextArea from "../../../components/TextArea";
import themeStyle from "../../../theme.style";

const FeedbackScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center",
      }}
    >
      <View style={{ padding: 10 }}>
        <Text
          style={{
            color: themeStyle.colors.primary.light,
            fontSize: 20,
            marginBottom: 20,
            fontWeight: "700",
          }}
        >
          We like to listen...
        </Text>
        <Text
          style={{ color: themeStyle.colors.grayscale.lowest, fontSize: 14 }}
        >
          We like to review the feedback and ideas that you feel would make
          Magnet better and more useful. If your idea is great and fits into
          Magnet, we&apos;ll add it!
        </Text>
      </View>
      <View
        style={{
          width: "100%",
        }}
      >
        <TextArea
          maxHeight={300}
          label={"General feedback"}
          placeholder="Example: Something is not working as it should"
        />
        <TextArea maxHeight={300} />
      </View>
    </View>
  );
};

export default FeedbackScreen;
