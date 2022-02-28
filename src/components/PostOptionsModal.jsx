import React, { useRef, useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  ActivityIndicator,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import themeStyle from "../theme.style";

const PostOptionsModal = ({
  showOptions,
  setShowPostOptions,
  reportPost,
  deletePost,
  editPost,
  belongsToUser,
}) => {
  const [showReportOptions, setShowReportOptions] = useState(false);

  const reportOptions = [
    "It's spam",
    "It does not belong on Magnet",
    "It's inappropriate",
  ];
  return (
    <Modal visible={showOptions} transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowPostOptions(null);
            setShowReportOptions(false);
          }}
        >
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <View
              style={{
                width: "100%",
                padding: 20,
                backgroundColor: themeStyle.colors.grayscale.higher,
              }}
            >
              {!showReportOptions ? (
                <View>
                  <TouchableOpacity onPress={() => setShowReportOptions(true)}>
                    <Text style={{ color: themeStyle.colors.grayscale.lowest }}>
                      Report
                    </Text>
                  </TouchableOpacity>
                  {belongsToUser ? (
                    <View>
                      <TouchableOpacity onPress={() => deletePost()}>
                        <Text
                          style={{ color: themeStyle.colors.grayscale.lowest }}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => editPost()}>
                        <Text
                          style={{ color: themeStyle.colors.grayscale.lowest }}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View>
                  {reportOptions.map((option, i) => (
                    <TouchableOpacity
                      key={`report-option-${i}`}
                      onPress={() => reportPost(i)}
                    >
                      <View
                        style={{
                          padding: 20,
                          borderBottomWidth: 0.5,
                          borderColor: themeStyle.colors.grayscale.low,
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            color: themeStyle.colors.secondary.default,
                          }}
                        >
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default PostOptionsModal;
