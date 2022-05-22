import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicatorBase,
  ActivityIndicator,
} from "react-native";
import themeStyle from "../theme.style";

const UserOptionsModal = ({
  showOptions,
  setShowUserOptions,
  reportUser,
  blockUser,
  unblockUser,
  error,
  onHide,
  user,
  loading,
  removeConnection,
}) => {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [showBlockUserGuard, setShowBlockUserGuard] = useState(false);

  const reportOptions = [
    "Profile is fake or contains spam",
    "Adult content",
    "Harassment or hateful speech",
    "I think this account is hacked",
    "Self harm",
  ];
  return (
    <Modal
      visible={showOptions}
      transparent
      onRequestClose={() => {
        setShowUserOptions(null);
        setShowReportOptions(false);
        setShowBlockUserGuard(false);
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" && "padding"}
        keyboardVerticalOffset={0}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setShowUserOptions(null);
            setShowReportOptions(false);
            setShowBlockUserGuard(false);
            if (onHide) onHide();
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
                paddingVertical: 10,
                backgroundColor: themeStyle.colors.grayscale.highest,
                borderTopColor: themeStyle.colors.grayscale.high,
                borderTopWidth: 2,
              }}
            >
              {error ? (
                <Text
                  style={{
                    alignSelf: "center",
                    fontSize: 12,
                    color: themeStyle.colors.error.default,
                    fontWeight: "700",
                  }}
                >
                  {error}
                </Text>
              ) : null}

              {loading ? (
                <ActivityIndicator size={"large"} animating />
              ) : showReportOptions ? (
                <View>
                  {reportOptions.map((option, i) => (
                    <TouchableOpacity
                      key={`report-option-${i}`}
                      onPress={() => reportUser(i)}
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
                            fontWeight: "700",
                          }}
                        >
                          {option}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : showBlockUserGuard ? (
                <View>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      fontWeight: "700",
                      marginBottom: 10,
                    }}
                  >
                    Are you sure?
                  </Text>
                  <Text
                    style={{
                      color: themeStyle.colors.grayscale.lowest,
                      paddingRight: 20,
                    }}
                  >
                    Blocking this user will remove them from your contacts if
                    already added.
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      blockUser();
                      setShowBlockUserGuard(false);
                    }}
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
                          fontWeight: "700",
                        }}
                      >
                        Block user
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingHorizontal: 15 }}>
                  {user.isFriend ? (
                    <TouchableOpacity
                      onPress={() => {
                        setShowUserOptions(false);
                        setShowReportOptions(false);
                        removeConnection();
                      }}
                      style={{ width: "100%" }}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          width: "100%",
                          height: 60,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: themeStyle.colors.error.default,
                            textAlign: "center",
                          }}
                        >
                          Remove Contact
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    onPress={() => {
                      setShowReportOptions(true);
                      setShowBlockUserGuard(false);
                    }}
                    style={{ width: "100%" }}
                  >
                    <View
                      style={{
                        padding: 10,
                        borderRadius: 5,
                        width: "100%",
                        height: 60,
                        borderTopWidth: user.isFriend ? 0.5 : 0,
                        borderColor: themeStyle.colors.grayscale.low,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          color: themeStyle.colors.grayscale.lowest,
                          textAlign: "center",
                        }}
                      >
                        Report User
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {!user.isSameUser && !user.blockedByUser ? (
                    <TouchableOpacity
                      onPress={() => {
                        setShowBlockUserGuard(true);
                        setShowReportOptions(false);
                      }}
                      style={{ width: "100%" }}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          width: "100%",
                          height: 60,
                          borderTopWidth: user.isFriend ? 0.5 : 0,
                          borderColor: themeStyle.colors.grayscale.low,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "700",
                            color: themeStyle.colors.grayscale.lowest,
                            textAlign: "center",
                          }}
                        >
                          Block User
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : user.blockedByUser ? (
                    <TouchableOpacity
                      onPress={() => unblockUser()}
                      style={{ width: "100%" }}
                    >
                      <View
                        style={{
                          padding: 10,
                          borderRadius: 5,
                          width: "100%",
                          height: 60,
                          borderTopWidth: user.isFriend ? 0.5 : 0,
                          borderColor: themeStyle.colors.grayscale.low,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "700",
                            color: themeStyle.colors.grayscale.lowest,
                            textAlign: "center",
                          }}
                        >
                          Unblock User
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default UserOptionsModal;
