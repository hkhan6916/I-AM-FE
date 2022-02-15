import React, { useEffect, useRef, useState } from "react";
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
} from "react-native";
import themeStyle from "../theme.style";
import apiCall from "../helpers/apiCall";

const CommentOptionsModal = ({
  comment,
  updateComment,
  setDeleted,
  setReplies,
  showOptions = false,
  setShowOptionsForComment,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
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

  const deleteComment = async () => {
    setLoading(true);
    const { success } = await apiCall(
      "DELETE",
      `/posts/comments/remove/${comment._id}`
    );
    setLoading(false);
    if (success) {
      setDeleted(true);
      if (setReplies) {
        setReplies([]);
      }
    }
    return;
  };

  //   const hideOptions = async () => {
  //     setShowOptionsForComment(false);
  //   };
  //   const updateComment = async (body) => {
  //     setLoading(true);
  //     const { success } = await apiCall("POST", "/posts/comments/update", {
  //       commentId: comment._id,
  //       body,
  //     });
  //     setLoading(false);
  //     if (success) {
  //       await hideOptions();
  //       const newComment = { ...comment, body, edited: true };
  //       setComment(newComment);
  //       setUpdated(true);
  //     } else {
  //       setError("An error occurred.");
  //     }
  //   };

  const reportComment = async (reasonIndex) => {
    setLoading(true);
    console.log(reasonIndex);
    const { success } = await apiCall("POST", "/posts/comment/report", {
      commentId: comment._id,
      reason: reasonIndex,
    });
    setLoading(false);
    if (success) {
      setReported(true);
    } else {
      setError("An error occurred.");
    }
  };

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
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                backgroundColor: themeStyle.colors.grayscale.white,
                borderWidth: 1,
                borderColor: themeStyle.colors.grayscale.lightGray,
                padding: 5,
              }}
            >
              {!comment.belongsToUser && !showReportOptions ? (
                <View style={{ marginVertical: 10 }}>
                  <TouchableOpacity onPress={() => setShowReportOptions(true)}>
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
              ) : reported ? (
                <View style={{ padding: 20 }}>
                  <Text
                    style={{
                      color: themeStyle.colors.success.default,
                    }}
                  >
                    Comment Reported
                  </Text>
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
                          borderColor: themeStyle.colors.grayscale.lightGray,
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
                  <View style={{ marginVertical: 10 }}>
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
                  {updated ? (
                    <Text
                      style={{
                        alignSelf: "flex-end",
                        fontSize: 12,
                        color: themeStyle.colors.grayscale.mediumGray,
                      }}
                    >
                      Reply updated
                    </Text>
                  ) : null}
                  {error ? (
                    <Text
                      style={{
                        alignSelf: "flex-end",
                        fontSize: 12,
                        color: themeStyle.colors.grayscale.mediumGray,
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
                        borderColor: themeStyle.colors.grayscale.lightGray,
                        borderRadius: 5,
                      },
                    ]}
                  >
                    <ScrollView pointerEvents="none">
                      <TextInput
                        ref={inputRef}
                        autoFocus
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
                      {!loading ? (
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
                      ) : (
                        <ActivityIndicator
                          animating
                          size="small"
                          color={themeStyle.colors.secondary.default}
                        />
                      )}
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
                        color: themeStyle.colors.grayscale.mediumGray,
                      }}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default React.memo(CommentOptionsModal);
