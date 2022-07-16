import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import themeStyle from "../theme.style";

const CELL_COUNT = 6;

const CodeInput = ({ onSubmit, loading }) => {
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View>
      <CodeField
        ref={ref}
        {...props}
        value={value}
        onChangeText={setValue}
        cellCount={CELL_COUNT}
        rootStyle={styles.codeFiledRoot}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        renderCell={({ index, symbol, isFocused }) => (
          <Text
            key={index}
            style={[styles.cell, isFocused && styles.focusCell]}
            onLayout={getCellOnLayoutHandler(index)}
          >
            {symbol || (isFocused ? <Cursor /> : null)}
          </Text>
        )}
      />
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          marginVertical: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => onSubmit(value)}
          style={{
            backgroundColor: themeStyle.colors.primary.default,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 20,
            paddingHorizontal: 20,
            paddingVertical: 10,
            minWidth: 100,
          }}
        >
          {!loading ? (
            <Text style={{ color: themeStyle.colors.white }}>Verify</Text>
          ) : (
            <ActivityIndicator
              size="small"
              color={themeStyle.colors.white}
              animating
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { padding: 20, minHeight: 300 },
  title: { textAlign: "center", fontSize: 30 },
  codeFiledRoot: { marginTop: 20 },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: themeStyle.colors.grayscale.low,
    textAlign: "center",
    color: themeStyle.colors.grayscale.lowest,
    borderRadius: 5,
  },
  focusCell: {
    borderColor: themeStyle.colors.grayscale.lowest,
  },
});

export default CodeInput;
