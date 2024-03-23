import { TextInput, View } from "react-native";
import themeStyle from "../../theme.style";
import useTypewriter from "../../helpers/hooks/useTypeWriter";
import { useState } from "react";

const GPTTextInput = ({ placeholderTextArray, ...rest }) => {
  const [disablePlaceholderTypewriter, setDisablePlaceholderTypewriter] =
    useState(false);
  const [text] = useTypewriter({
    words: placeholderTextArray,
    loop: 5,
    disabled: disablePlaceholderTypewriter,
  });

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: themeStyle.colors.grayscale.lowest,
        borderRadius: 5,
        padding: 5,
        flex: 1,
        marginBottom: 10,
      }}
    >
      <TextInput
        style={{
          textAlignVertical: "top",
          fontSize: 16,
          color: themeStyle.colors.grayscale.lowest,
          flex: 1,
          height: "100%",
        }}
        placeholder={
          disablePlaceholderTypewriter ? "Keep it short and concise." : text
        }
        placeholderTextColor={themeStyle.colors.grayscale.high}
        onFocus={() => {
          setDisablePlaceholderTypewriter(true);
        }}
        {...rest}
      />
    </View>
  );
};

export default GPTTextInput;
