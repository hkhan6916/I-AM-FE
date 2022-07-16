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
  error,
}) => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showDeleteGuard, setShowDeleteGuard] = useState(false);

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
            setShowDeleteGuard(false);
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
                backgroundColor: themeStyle.colors.grayscale.cards,
                paddingBottom: 40,
              }}
            >
              {error ? (
                <Text
                  style={{
                    alignSelf: "flex-end",
                    fontSize: 12,
                    color: themeStyle.colors.error.default,
                    fontWeight: "700",
                  }}
                >
                  {error}
                </Text>
              ) : null}
              {!showReportOptions && !showDeleteGuard ? (
                <View style={{ alignItems: "center" }}>
                  {!belongsToUser ? (
                    <TouchableOpacity
                      onPress={() => setShowReportOptions(true)}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          textAlign: "center",
                          marginBottom: 20,
                          fontWeight: "700",
                        }}
                      >
                        Report
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                  {belongsToUser ? (
                    <View style={{ width: "100%" }}>
                      <TouchableOpacity
                        style={{
                          height: 48,
                          justifyContent: "center",
                          borderBottomWidth: 0.5,
                          borderColor: themeStyle.colors.grayscale.low,
                          alignItems: "center",
                        }}
                        onPress={() => editPost()}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.grayscale.lowest,
                            textAlign: "center",
                            marginBottom: 20,
                            paddingHorizontal: 40,
                          }}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowDeleteGuard(true)}
                        style={{
                          height: 48,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.error.default,
                            textAlign: "center",
                          }}
                        >
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : showDeleteGuard ? (
                <View>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      marginBottom: 20,
                      marginLeft: 20,
                    }}
                  >
                    Are you sure?
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      onPress={async () => {
                        await deletePost();
                        setShowDeleteGuard(false);
                      }}
                      style={{ height: 48, justifyContent: "center" }}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.error.default,
                          paddingHorizontal: 20,
                        }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteGuard(false)}
                      style={{ height: 48, justifyContent: "center" }}
                    >
                      <Text
                        style={{
                          color: themeStyle.colors.grayscale.lowest,
                          textAlign: "center",
                          paddingHorizontal: 40,
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                            color: themeStyle.colors.grayscale.lowest,
                            fontWeight: "700",
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
