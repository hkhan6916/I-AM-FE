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

const CommentOptionsModal = ({
  comment,
  updateComment,
  deleteComment,
  showOptions = false,
  setShowOptionsForComment,
  loading: parentLoading,
  error,
  reportComment,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentBody, setCommentBody] = useState(comment.body);
  const [height, setHeight] = useState(0);
  const [showReportOptions, setShowReportOptions] = useState(false);
  const { width: screenWidth } = Dimensions.get("window");
  const inputRef = useRef(null);

  const reportOptions = [
    "It's spam",
    "It does not belong on Magnet",
    "It's inappropriate",
  ];

  const resetOptions = () => {
    setShowOptionsForComment(null);
    setIsEditing(false);
    setShowReportOptions(false);
  };

  return (
    <Modal
      visible={showOptions}
      transparent
      onRequestClose={() => resetOptions()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => resetOptions()}>
          <View
            style={{
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            <TouchableWithoutFeedback>
              {parentLoading ? (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    backgroundColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 1,
                    borderColor: themeStyle.colors.grayscale.low,
                    padding: 20,
                  }}
                >
                  <ActivityIndicator
                    animating
                    color={themeStyle.colors.primary.default}
                    size={"large"}
                  />
                </View>
              ) : (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    backgroundColor: themeStyle.colors.grayscale.lowest,
                    borderWidth: 1,
                    borderColor: themeStyle.colors.grayscale.low,
                    padding: 5,
                  }}
                >
                  {!comment.belongsToUser && !showReportOptions ? (
                    <View style={{ marginVertical: 10 }}>
                      <TouchableOpacity
                        onPress={() => setShowReportOptions(true)}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.secondary.default,
                            marginHorizontal: 10,
                            textAlign: "center",
                          }}
                        >
                          Report Comment
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : showReportOptions ? (
                    <View>
                      {reportOptions.map((option, i) => (
                        <TouchableOpacity
                          key={`report-option-${i}`}
                          onPress={() => reportComment(i)}
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
                  ) : null}
                  {comment.belongsToUser && !isEditing ? (
                    <View>
                      <View style={{ marginVertical: 10 }}>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                          <Text
                            style={{
                              color: themeStyle.colors.secondary.default,
                              marginHorizontal: 10,
                              textAlign: "center",
                            }}
                          >
                            Edit
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ marginVertical: 30 }}>
                        <TouchableOpacity onPress={() => deleteComment()}>
                          <Text
                            style={{
                              color: themeStyle.colors.error.default,
                              marginHorizontal: 10,
                              textAlign: "center",
                            }}
                          >
                            Delete
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : isEditing ? (
                    <View
                      style={{
                        marginVertical: 40,
                        height: 200,
                        width: screenWidth / 1.2,
                        justifyContent: "center",
                      }}
                    >
                      {error ? (
                        <Text
                          style={{
                            alignSelf: "flex-end",
                            fontSize: 12,
                            color: themeStyle.colors.grayscale.high,
                          }}
                        >
                          {error}
                        </Text>
                      ) : null}
                      <View
                        style={[
                          {
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingHorizontal: 10,
                            borderWidth: 0.5,
                            borderColor: themeStyle.colors.grayscale.low,
                            borderRadius: 5,
                          },
                        ]}
                      >
                        <ScrollView>
                          <TextInput
                            ref={inputRef}
                            maxLength={2000}
                            multiline
                            style={[
                              {
                                paddingVertical: 10,
                                height: Math.max(48, height),
                              },
                            ]}
                            returnKeyType="go"
                            value={commentBody}
                            onChangeText={(v) => setCommentBody(v)}
                            onContentSizeChange={(event) => {
                              setHeight(
                                event.nativeEvent.contentSize.height < 150
                                  ? event.nativeEvent.contentSize.height
                                  : 150
                              );
                            }}
                          />
                        </ScrollView>
                        <View
                          style={{
                            alignSelf: "flex-end",
                            marginVertical: 16,
                            marginLeft: 5,
                          }}
                        >
                          <TouchableOpacity
                            disabled={!commentBody}
                            onPress={() => updateComment(commentBody)}
                          >
                            <View
                              style={{
                                height: 48,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text
                                style={[
                                  {
                                    color: themeStyle.colors.secondary.default,
                                    fontWeight: "700",
                                  },
                                  !commentBody && { opacity: 0.5 },
                                ]}
                              >
                                Post
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{
                          alignSelf: "flex-end",
                          marginVertical: 5,
                        }}
                        onPress={() => setIsEditing(false)}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.grayscale.high,
                          }}
                        >
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              )}
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default React.memo(CommentOptionsModal);
