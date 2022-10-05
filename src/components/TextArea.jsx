import React, { useState } from "react";
import { TextInput, ScrollView, View, Text } from "react-native";
import themeStyle from "../theme.style";

const TextArea = ({
  maxHeight = 150,
  borderColor,
  setValue,
  value,
  label,
  ...rest
}) => {
  const [height, setHeight] = useState(0);

  return (
    <ScrollView>
      <Text
        style={{
          fontWeight: "400",
          fontSize: 12,
          color: themeStyle.colors.grayscale.lowest,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 10,
          borderWidth: 2,
          borderColor: borderColor || themeStyle.colors.grayscale.low,
          borderRadius: 5,
        }}
      >
        <TextInput
          maxLength={2000}
          multiline
          style={[
            {
              paddingVertical: 10,
              height: Math.max(48, height),
              color: themeStyle.colors.grayscale.lowest,
            },
          ]}
          value={value}
          onChangeText={(v) => setValue(v)}
          onContentSizeChange={(event) => {
            setHeight(
              event.nativeEvent.contentSize.height < maxHeight
                ? event.nativeEvent.contentSize.height
                : maxHeight
            );
          }}
          {...rest}
        />
      </View>
    </ScrollView>
  );
};

export default TextArea;
