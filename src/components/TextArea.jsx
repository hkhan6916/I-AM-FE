import React, { useState } from "react";
import { TextInput, View, Text, Keyboard } from "react-native";
import themeStyle from "../theme.style";

const TextArea = ({
  maxHeight = 150,
  minHeight = 48,
  borderColor,
  setValue = () => null,
  value,
  label,
  labelColor,
  color,
  ...rest
}) => {
  const [height, setHeight] = useState(0);
  const [isScrollEnabled, setIsScrollEnabled] = React.useState(true);

  const onKeyboardWillShow = () => {
    setIsScrollEnabled(false);
  };

  const onKeyboardDidShow = () => {
    setIsScrollEnabled(true);
  };

  React.useEffect(() => {
    const subKWS = Keyboard.addListener("keyboardWillShow", onKeyboardWillShow);
    const subKDS = Keyboard.addListener("keyboardDidShow", onKeyboardDidShow);

    return () => {
      subKWS.remove();
      subKDS.remove();
    };
  }, []);
  return (
    <View>
      <Text
        style={{
          fontWeight: "400",
          fontSize: 12,
          color: labelColor || themeStyle.colors.grayscale.lowest,
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
              height: Math.max(minHeight, height),
              color: color || themeStyle.colors.grayscale.lowest,
              width: "100%",
            },
          ]}
          value={value}
          onChangeText={(v) => setValue(v)}
          placeholderTextColor={themeStyle.colors.grayscale.low}
          scrollEnabled={isScrollEnabled}
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
    </View>
  );
};

export default TextArea;
